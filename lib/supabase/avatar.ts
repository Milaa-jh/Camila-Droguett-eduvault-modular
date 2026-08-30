import { createClient } from '@/lib/supabase/client';

const BUCKET = 'avatars';

/**
 * Sube (o reemplaza) el avatar del usuario. El bucket 'avatars' es público,
 * por lo que se puede devolver directamente la URL pública para mostrarlo.
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const supabase = createClient();
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}/avatar.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (error) return { url: null, error: error.message };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  // Se agrega un parámetro de caché para forzar la recarga tras reemplazar el avatar
  return { url: `${data.publicUrl}?t=${Date.now()}`, error: null };
}
