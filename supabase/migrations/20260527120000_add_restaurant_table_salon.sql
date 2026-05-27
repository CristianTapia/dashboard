alter table public.restaurant_tables
  add column if not exists salon text not null default 'Salon 1';

update public.restaurant_tables
set salon = 'Salon 1'
where salon is null or btrim(salon) = '';

alter table public.restaurant_tables
  drop constraint if exists restaurant_tables_salon_not_blank;

alter table public.restaurant_tables
  add constraint restaurant_tables_salon_not_blank
  check (btrim(salon) <> '');

drop index if exists public.restaurant_tables_tenant_number_uidx;

create unique index if not exists restaurant_tables_tenant_salon_number_uidx
  on public.restaurant_tables (tenant_id, salon, number)
  where number is not null;

create index if not exists restaurant_tables_tenant_salon_idx
  on public.restaurant_tables (tenant_id, salon);
