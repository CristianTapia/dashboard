alter table public.highlights
  add column if not exists active boolean not null default true;

update public.highlights
set active = true
where active is null;
