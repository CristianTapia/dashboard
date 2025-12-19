alter table categories add column tenant_id uuid references tenants(id) not null;
create index on categories (tenant_id);
create unique index on categories (tenant_id, name); -- evita nombres duplicados dentro del mismo restaurante
