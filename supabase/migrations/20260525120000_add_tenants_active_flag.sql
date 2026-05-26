alter table public.tenants
  add column if not exists active boolean not null default true;

update public.tenants
set active = true
where active is null;

create index if not exists tenants_active_name_idx
  on public.tenants (active, name);
