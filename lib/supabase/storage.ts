import { createClient } from '@/lib/supabase/client';

const BUCKET = 'materials';

/**
 * Sube un archivo al bucket privado 'materials', dentro de una carpeta
 * por usuario y unidad para mantener orden y evitar colisiones de nombre.
 * Devuelve la ruta interna (no la URL pública, ya que el bucket es privado).
 */
export async function uploadMaterialFile(
  userId: string,
  unitId: string,
  file: File
): Promise<{ path: string | null; error: string | null }> {
  const supabase = createClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const path = `${userId}/${unitId}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) return { path: null, error: error.message };
  return { path, error: null };
}

/** Genera una URL temporal (1 hora) para descargar/ver un archivo privado. */
export async function getMaterialSignedUrl(path: string): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
  if (error) return null;
  return data.signedUrl;
}

/** Elimina un archivo del bucket (usado al borrar un material o al fallar el guardado). */
export async function deleteMaterialFile(path: string): Promise<void> {
  const supabase = createClient();
  await supabase.storage.from(BUCKET).remove([path]);
}
