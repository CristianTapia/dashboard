alter table public.categories
  drop constraint if exists categories_tenant_id_fkey;

alter table public.categories
  add constraint categories_tenant_id_fkey
  foreign key (tenant_id) references public.tenants(id) on delete cascade;
