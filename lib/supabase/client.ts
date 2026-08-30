import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

/**
 * Cliente de Supabase para usar dentro de Client Components ('use client').
 * Cada componente que lo necesite debe llamar a createClient() de nuevo;
 * @supabase/ssr gestiona internamente la reutilización de la sesión.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
