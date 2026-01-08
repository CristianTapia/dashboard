drop policy if exists "tenant_members_select_own" on public.tenant_members;
create policy "tenant_members_select_own"
on public.tenant_members
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "tenants_select_if_member" on public.tenants;
create policy "tenants_select_if_member"
on public.tenants
for select
to authenticated
using (
  exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = tenants.id
      and tm.user_id = auth.uid()
  )
);
