alter table public.tenants
  add column if not exists menu_themes_enabled boolean not null default false,
  add column if not exists menu_theme text not null default 'default';

alter table public.tenants
  drop constraint if exists tenants_menu_theme_check;

alter table public.tenants
  add constraint tenants_menu_theme_check
  check (menu_theme in ('default', 'summer', 'winter', 'halloween', 'christmas'));

update public.tenants
set
  menu_themes_enabled = coalesce(menu_themes_enabled, false),
  menu_theme = coalesce(menu_theme, 'default');
