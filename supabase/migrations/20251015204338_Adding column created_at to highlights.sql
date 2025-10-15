-- 1) Agregar columna con default y not null
alter table public.highlights
  add column if not exists created_at timestamptz not null default now();

-- 2) Índice para ordenar/filtrar rápido por lo más reciente
create index if not exists idx_highlights_created_at_desc
  on public.highlights (created_at desc);
