create table if not exists highlights (
  id bigserial primary key,
  description text not null,
  image_url text not null,
  starts_at timestamptz,     -- opcional
  ends_at timestamptz       -- opcional
);

create index on highlights (starts_at);
create index on highlights (ends_at);
