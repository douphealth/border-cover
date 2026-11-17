alter table public.evidence_reviews add column approved_by uuid;
alter table public.correction_reports add column kind text not null default 'correction' check(kind in ('correction','insurer-request'));
alter policy reviewers_read_evidence on public.evidence_reviews using(public.has_role(auth.uid(),'reviewer'));
create or replace function public.audit_evidence_review() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if old.status='approved' then raise exception 'Create a new draft revision rather than editing approved evidence'; end if;
 if new.created_by is distinct from old.created_by then raise exception 'Draft authorship is immutable'; end if;
 if new.status='approved' and old.status is distinct from new.status then
  if auth.uid() is null or auth.uid()=old.created_by or not public.has_role(auth.uid(),'reviewer') then raise exception 'An independent authorized reviewer must approve'; end if;
  if new.review_due<=current_date or length(trim(new.reviewer_name))<2 or length(trim(new.policy_edition))<1 or length(trim(new.section))<1 or length(trim(new.quotation))<20 or length(trim(new.conflicts))>0 then raise exception 'Approval requires current review deadline, attribution, edition, passage and no unresolved conflicts'; end if;
  new.approved_by=auth.uid(); new.human_verified_at=now();
 else new.approved_by=null; new.human_verified_at=null;
 end if;
 insert into public.evidence_history(review_id,actor_id,record) values(new.id,auth.uid(),to_jsonb(new)); return new;
end $$;
revoke all on function public.audit_evidence_review() from public,anon,authenticated;
create table public.review_tasks(id uuid primary key default gen_random_uuid(),source_id text not null,reason text not null,status text not null default 'open' check(status in ('open','resolved')),assigned_to uuid,created_at timestamptz not null default now(),resolved_at timestamptz);
grant select,update on public.review_tasks to authenticated; grant all on public.review_tasks to service_role;
alter table public.review_tasks enable row level security;
create policy reviewers_read_tasks on public.review_tasks for select to authenticated using(public.has_role(auth.uid(),'reviewer'));
create policy reviewers_update_tasks on public.review_tasks for update to authenticated using(public.has_role(auth.uid(),'reviewer')) with check(public.has_role(auth.uid(),'reviewer') and (assigned_to is null or public.has_role(assigned_to,'reviewer')));
create unique index one_open_source_task on public.review_tasks(source_id) where status='open';
create function public.queue_source_review() returns trigger language plpgsql security definer set search_path=public as $$ begin
 if new.outcome in ('changed-review-required','redirect-manual-review','broken-or-blocked','unavailable-manual-review') then
 insert into public.review_tasks(source_id,reason) values(new.source_id,new.outcome) on conflict(source_id) where status='open' do update set reason=excluded.reason;
 end if;return new;end $$;
revoke all on function public.queue_source_review() from public,anon,authenticated;
create trigger source_review_task after insert on public.source_observations for each row execute function public.queue_source_review();