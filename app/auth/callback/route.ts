import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Recibe el "code" que Supabase envía tras confirmar el correo o el
 * enlace de recuperación de contraseña, e inicia sesión con él.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
