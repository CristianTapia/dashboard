create table if not exists public.table_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  primary_table_id uuid references public.restaurant_tables(id) on delete set null,
  status text not null default 'active',
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  opened_by uuid references auth.users(id) on delete set null,
  closed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint table_sessions_status_check check (status in ('active', 'closed', 'cancelled')),
  constraint table_sessions_closed_state_check check (
    (status = 'active' and closed_at is null)
    or (status <> 'active' and closed_at is not null)
  )
);

create index if not exists table_sessions_tenant_id_status_idx
  on public.table_sessions (tenant_id, status);

create index if not exists table_sessions_tenant_id_opened_at_idx
  on public.table_sessions (tenant_id, opened_at desc);

create index if not exists table_sessions_primary_table_id_idx
  on public.table_sessions (primary_table_id);

alter table public.table_sessions enable row level security;

drop policy if exists "table_sessions_select_if_member" on public.table_sessions;
create policy "table_sessions_select_if_member"
on public.table_sessions
for select
using (
  exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = table_sessions.tenant_id
      and tm.user_id = auth.uid()
  )
);

drop policy if exists "table_sessions_insert_if_member" on public.table_sessions;
create policy "table_sessions_insert_if_member"
on public.table_sessions
for insert
with check (
  exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = table_sessions.tenant_id
      and tm.user_id = auth.uid()
  )
);

drop policy if exists "table_sessions_update_if_member" on public.table_sessions;
create policy "table_sessions_update_if_member"
on public.table_sessions
for update
using (
  exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = table_sessions.tenant_id
      and tm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = table_sessions.tenant_id
      and tm.user_id = auth.uid()
  )
);

drop policy if exists "table_sessions_delete_if_member" on public.table_sessions;
create policy "table_sessions_delete_if_member"
on public.table_sessions
for delete
using (
  exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = table_sessions.tenant_id
      and tm.user_id = auth.uid()
  )
);

create table if not exists public.table_session_tables (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  session_id uuid not null references public.table_sessions(id) on delete cascade,
  table_id uuid not null references public.restaurant_tables(id) on delete cascade,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  joined_by uuid references auth.users(id) on delete set null,
  left_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint table_session_tables_left_after_joined_check check (left_at is null or left_at >= joined_at)
);

create index if not exists table_session_tables_tenant_id_idx
  on public.table_session_tables (tenant_id);

create index if not exists table_session_tables_session_id_idx
  on public.table_session_tables (session_id);

create index if not exists table_session_tables_table_id_idx
  on public.table_session_tables (table_id);

create unique index if not exists table_session_tables_one_open_session_per_table_uidx
  on public.table_session_tables (table_id)
  where left_at is null;

alter table public.table_session_tables enable row level security;

drop policy if exists "table_session_tables_select_if_member" on public.table_session_tables;
create policy "table_session_tables_select_if_member"
on public.table_session_tables
for select
using (
  exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = table_session_tables.tenant_id
      and tm.user_id = auth.uid()
  )
);

drop policy if exists "table_session_tables_insert_if_member" on public.table_session_tables;
create policy "table_session_tables_insert_if_member"
on public.table_session_tables
for insert
with check (
  exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = table_session_tables.tenant_id
      and tm.user_id = auth.uid()
  )
);

drop policy if exists "table_session_tables_update_if_member" on public.table_session_tables;
create policy "table_session_tables_update_if_member"
on public.table_session_tables
for update
using (
  exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = table_session_tables.tenant_id
      and tm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = table_session_tables.tenant_id
      and tm.user_id = auth.uid()
  )
);

drop policy if exists "table_session_tables_delete_if_member" on public.table_session_tables;
create policy "table_session_tables_delete_if_member"
on public.table_session_tables
for delete
using (
  exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = table_session_tables.tenant_id
      and tm.user_id = auth.uid()
  )
);

alter table public.table_events
  add column if not exists session_id uuid references public.table_sessions(id) on delete set null;

create index if not exists table_events_session_id_created_at_idx
  on public.table_events (session_id, created_at desc);
