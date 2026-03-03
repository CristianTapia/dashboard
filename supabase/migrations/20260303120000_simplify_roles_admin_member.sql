-- Simplifica roles de tenant_members a solo admin/member
-- 1) Migra owner -> admin
-- 2) Asegura valores validos
-- 3) Aplica default y constraint

update public.tenant_members
set role = 'admin'
where role = 'owner';

update public.tenant_members
set role = 'member'
where role is null
   or role not in ('admin', 'member');

alter table public.tenant_members
  alter column role set default 'member';

alter table public.tenant_members
  drop constraint if exists tenant_members_role_check;

alter table public.tenant_members
  add constraint tenant_members_role_check
  check (role in ('admin', 'member'));
