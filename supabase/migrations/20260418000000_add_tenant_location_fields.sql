alter table public.tenants
  add column if not exists address text,
  add column if not exists latitude numeric,
  add column if not exists longitude numeric,
  add column if not exists maps_url text;
