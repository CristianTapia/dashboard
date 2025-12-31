alter table categories enable row level security;

create policy "tenant_members_can_all"
on categories
for all
using (
  exists (
    select 1
    from tenant_members tm
    where tm.tenant_id = categories.tenant_id
      and tm.user_id = auth.uid()
  )
);

create index if not exists categories_tenant_id_idx
on categories (tenant_id);

create unique index if not exists categories_tenant_name_idx
on categories (tenant_id, name);
