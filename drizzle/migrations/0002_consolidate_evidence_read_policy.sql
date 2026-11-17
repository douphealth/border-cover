drop policy approved_signedin_evidence on public.evidence_reviews;
alter policy reviewers_read_evidence on public.evidence_reviews using(status='approved' or public.has_role(auth.uid(),'reviewer'));