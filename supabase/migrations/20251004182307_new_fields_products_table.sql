alter table public.products
  add column if not exists sale_price numeric,                       -- precio de oferta
  add column if not exists sale_starts_at timestamptz,               -- opcional
  add column if not exists sale_ends_at timestamptz,                 -- opcional
  add column if not exists sale_badge text;                          -- ej: "-20%", "Happy Hour"

-- (opcionales pero recomendados)
-- create index on products (sale_starts_at);
-- create index on products (sale_ends_at);
-- alter table products
--   add constraint sale_price_lt_price check (
--     sale_price is null or sale_price < price
--   );