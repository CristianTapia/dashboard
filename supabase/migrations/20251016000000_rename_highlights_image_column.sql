-- Rename image_url -> image_path to align naming with products
alter table if exists public.highlights
  rename column image_url to image_path;

-- If any legacy rows stored a full public URL, normalize to storage path
-- Assumes bucket path contains "/images/"; adjust if your bucket id differs
update public.highlights
set image_path = split_part(image_path, '/images/', 2)
where image_path like 'http%' and image_path like '%/images/%';

