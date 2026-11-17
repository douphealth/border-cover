alter table public.evidence_reviews add column accessed_on date;
alter table public.evidence_reviews add column effective_from date;
create function public.require_access_date_for_approval() returns trigger language plpgsql set search_path=public as $$ begin if new.status='approved' and old.status<>'approved' and new.accessed_on is null then raise exception 'Record the actual source access date before approval'; end if;return new;end $$;
revoke all on function public.require_access_date_for_approval() from public,anon,authenticated;
create trigger require_review_access_date before update on public.evidence_reviews for each row execute function public.require_access_date_for_approval();