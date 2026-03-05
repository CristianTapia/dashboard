alter table public.highlights
  add column if not exists tenant_id uuid references public.tenants(id) on delete cascade;

create index if not exists highlights_tenant_id_idx on public.highlights (tenant_id);
create index if not exists highlights_tenant_created_at_idx on public.highlights (tenant_id, created_at desc);

alter table public.highlights enable row level security;

drop policy if exists "Deny all access by default" on public.highlights;
drop policy if exists "highlights_select_if_member" on public.highlights;
drop policy if exists "highlights_insert_if_member" on public.highlights;
drop policy if exists "highlights_update_if_member" on public.highlights;
drop policy if exists "highlights_delete_if_member" on public.highlights;

create policy "highlights_select_if_member"
on public.highlights
for select
to authenticated
using (
  exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = highlights.tenant_id
      and tm.user_id = auth.uid()
  )
);

create policy "highlights_insert_if_member"
on public.highlights
for insert
to authenticated
with check (
  highlights.tenant_id is not null
  and exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = highlights.tenant_id
      and tm.user_id = auth.uid()
  )
);

create policy "highlights_update_if_member"
on public.highlights
for update
to authenticated
using (
  exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = highlights.tenant_id
      and tm.user_id = auth.uid()
  )
)
with check (
  highlights.tenant_id is not null
  and exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = highlights.tenant_id
      and tm.user_id = auth.uid()
  )
);

create policy "highlights_delete_if_member"
on public.highlights
for delete
to authenticated
using (
  exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = highlights.tenant_id
      and tm.user_id = auth.uid()
  )
);
