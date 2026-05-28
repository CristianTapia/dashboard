alter table public.tenant_members
  drop constraint if exists tenant_members_role_check;

alter table public.tenant_members
  add constraint tenant_members_role_check
  check (role in ('admin', 'tenant_admin', 'staff', 'member'));

create table if not exists public.tenant_staff_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  salon text,
  table_id uuid references public.restaurant_tables(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint tenant_staff_assignments_target_check check (salon is not null or table_id is not null)
);

create unique index if not exists tenant_staff_assignments_user_salon_uidx
  on public.tenant_staff_assignments (tenant_id, user_id, salon)
  where salon is not null;

create unique index if not exists tenant_staff_assignments_user_table_uidx
  on public.tenant_staff_assignments (tenant_id, user_id, table_id)
  where table_id is not null;

create index if not exists tenant_staff_assignments_user_idx
  on public.tenant_staff_assignments (tenant_id, user_id);

alter table public.tenant_staff_assignments enable row level security;

drop policy if exists "tenant_staff_assignments_select_if_member" on public.tenant_staff_assignments;
create policy "tenant_staff_assignments_select_if_member"
on public.tenant_staff_assignments
for select
using (
  exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = tenant_staff_assignments.tenant_id
      and tm.user_id = auth.uid()
  )
);
