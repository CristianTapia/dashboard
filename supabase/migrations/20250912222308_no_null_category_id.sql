-- Enforce NOT NULL

BEGIN;

ALTER TABLE public.products
  ALTER COLUMN category_id SET NOT NULL;