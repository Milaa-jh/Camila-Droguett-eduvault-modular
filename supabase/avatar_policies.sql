-- ============================================================
-- EduVault Modular — Políticas de Storage para el bucket 'avatars'
-- Requisito previo: crear el bucket 'avatars' desde Storage > New bucket,
-- esta vez SÍ marcado como "Public bucket" (para mostrar la foto de perfil
-- sin necesidad de URLs firmadas). Ruta de archivo: {user_id}/avatar.{ext}
-- ============================================================

-- Cualquiera puede VER los avatares (bucket público), pero solo el dueño
-- puede subir, actualizar o eliminar el suyo.
create policy "avatars_public_select"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "avatars_insert_own"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "avatars_update_own"
on storage.objects for update
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "avatars_delete_own"
on storage.objects for delete
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);
