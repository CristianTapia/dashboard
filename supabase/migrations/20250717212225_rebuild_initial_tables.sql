-- Crear nuevamente categories y products
CREATE TABLE IF NOT EXISTS categories (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id           BIGSERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  price        INTEGER NOT NULL,
  stock        INTEGER NOT NULL,
  category_id  BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);
