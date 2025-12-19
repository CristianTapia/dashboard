create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text unique,
  created_at timestamptz default now()
);

-- 🔐 habilitar RLS inmediatamente
alter table public.tenants enable row level security;