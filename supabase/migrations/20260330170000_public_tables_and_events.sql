create table if not exists public.restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text,
  number text,
  public_token text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists restaurant_tables_tenant_id_idx
  on public.restaurant_tables (tenant_id);

create unique index if not exists restaurant_tables_tenant_number_uidx
  on public.restaurant_tables (tenant_id, number)
  where number is not null;

create index if not exists restaurant_tables_public_token_idx
  on public.restaurant_tables (public_token);

alter table public.restaurant_tables enable row level security;

drop policy if exists "restaurant_tables_select_if_member" on public.restaurant_tables;
create policy "restaurant_tables_select_if_member"
on public.restaurant_tables
for select
using (
  exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = restaurant_tables.tenant_id
      and tm.user_id = auth.uid()
  )
);

drop policy if exists "restaurant_tables_insert_if_member" on public.restaurant_tables;
create policy "restaurant_tables_insert_if_member"
on public.restaurant_tables
for insert
with check (
  exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = restaurant_tables.tenant_id
      and tm.user_id = auth.uid()
  )
);

drop policy if exists "restaurant_tables_update_if_member" on public.restaurant_tables;
create policy "restaurant_tables_update_if_member"
on public.restaurant_tables
for update
using (
  exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = restaurant_tables.tenant_id
      and tm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = restaurant_tables.tenant_id
      and tm.user_id = auth.uid()
  )
);

drop policy if exists "restaurant_tables_delete_if_member" on public.restaurant_tables;
create policy "restaurant_tables_delete_if_member"
on public.restaurant_tables
for delete
using (
  exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = restaurant_tables.tenant_id
      and tm.user_id = auth.uid()
  )
);

create table if not exists public.table_events (
  id bigint generated always as identity primary key,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  table_id uuid not null references public.restaurant_tables(id) on delete cascade,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists table_events_table_id_created_at_idx
  on public.table_events (table_id, created_at desc);

create index if not exists table_events_tenant_id_created_at_idx
  on public.table_events (tenant_id, created_at desc);

alter table public.table_events enable row level security;

drop policy if exists "table_events_select_if_member" on public.table_events;
create policy "table_events_select_if_member"
on public.table_events
for select
using (
  exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = table_events.tenant_id
      and tm.user_id = auth.uid()
  )
);
