-- ============================================================
-- EduVault Modular — Políticas de Storage para el bucket 'materials'
-- Requisito previo: crear el bucket 'materials' (privado) desde
-- Storage > New bucket en el dashboard de Supabase.
-- Los archivos se guardan con la ruta: {user_id}/{unit_id}/{archivo}
-- por lo que basta con verificar que el primer segmento de la ruta
-- coincida con el uid del usuario autenticado.
-- ============================================================

create policy "materials_storage_select_own"
on storage.objects for select
using (
  bucket_id = 'materials'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "materials_storage_insert_own"
on storage.objects for insert
with check (
  bucket_id = 'materials'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "materials_storage_update_own"
on storage.objects for update
using (
  bucket_id = 'materials'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "materials_storage_delete_own"
on storage.objects for delete
using (
  bucket_id = 'materials'
  and auth.uid()::text = (storage.foldername(name))[1]
);
