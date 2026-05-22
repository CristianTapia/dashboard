alter table public.products
  add column if not exists active boolean not null default true;

create index if not exists products_tenant_active_created_at_idx
  on public.products (tenant_id, active, created_at desc);
