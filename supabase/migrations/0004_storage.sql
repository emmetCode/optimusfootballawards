-- 0004_storage.sql
-- One public-read bucket. Only admins can list, upload, replace or delete files.
-- Files are served through public URLs, so images load without any policy for visitors.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'awards-media',
  'awards-media',
  true,
  5242880,  -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "awards-media: admin list"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'awards-media' and public.is_admin());

create policy "awards-media: admin upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'awards-media' and public.is_admin());

create policy "awards-media: admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'awards-media' and public.is_admin())
  with check (bucket_id = 'awards-media' and public.is_admin());

create policy "awards-media: admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'awards-media' and public.is_admin());
