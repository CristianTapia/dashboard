alter table public.products
  add column if not exists tenant_id uuid references public.tenants(id) on delete cascade;

update public.products p
set tenant_id = c.tenant_id
from public.categories c
where p.tenant_id is null
  and p.category_id = c.id;

create index if not exists products_tenant_id_idx on public.products (tenant_id);
create index if not exists products_tenant_created_at_idx on public.products (tenant_id, created_at desc);

alter table public.products enable row level security;

drop policy if exists "Deny all access by default" on public.products;
drop policy if exists "products_select_if_member" on public.products;
drop policy if exists "products_insert_if_member" on public.products;
drop policy if exists "products_update_if_member" on public.products;
drop policy if exists "products_delete_if_member" on public.products;

create policy "products_select_if_member"
on public.products
for select
to authenticated
using (
  exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = products.tenant_id
      and tm.user_id = auth.uid()
  )
);

create policy "products_insert_if_member"
on public.products
for insert
to authenticated
with check (
  products.tenant_id is not null
  and exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = products.tenant_id
      and tm.user_id = auth.uid()
  )
  and (
    products.category_id is null
    or exists (
      select 1
      from public.categories c
      where c.id = products.category_id
        and c.tenant_id = products.tenant_id
    )
  )
);

create policy "products_update_if_member"
on public.products
for update
to authenticated
using (
  exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = products.tenant_id
      and tm.user_id = auth.uid()
  )
)
with check (
  products.tenant_id is not null
  and exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = products.tenant_id
      and tm.user_id = auth.uid()
  )
  and (
    products.category_id is null
    or exists (
      select 1
      from public.categories c
      where c.id = products.category_id
        and c.tenant_id = products.tenant_id
    )
  )
);

create policy "products_delete_if_member"
on public.products
for delete
to authenticated
using (
  exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = products.tenant_id
      and tm.user_id = auth.uid()
  )
);
