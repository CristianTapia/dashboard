-- drop old policy
drop policy if exists tenant_isolation on public.categories;

-- ensure RLS
alter table public.categories enable row level security;

-- policies for categories table with tenant membership checks
create policy "categories_select_if_member"
on public.categories
for select
to authenticated
using (
  exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = categories.tenant_id
      and tm.user_id = auth.uid()
  )
);

create policy "categories_insert_if_member"
on public.categories
for insert
to authenticated
with check (
  exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = categories.tenant_id
      and tm.user_id = auth.uid()
  )
);

create policy "categories_update_if_member"
on public.categories
for update
to authenticated
using (
  exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = categories.tenant_id
      and tm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = categories.tenant_id
      and tm.user_id = auth.uid()
  )
);

create policy "categories_delete_if_member"
on public.categories
for delete
to authenticated
using (
  exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = categories.tenant_id
      and tm.user_id = auth.uid()
  )
);
