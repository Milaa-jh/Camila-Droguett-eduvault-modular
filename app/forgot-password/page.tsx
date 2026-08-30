'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { isValidEmail } from '@/lib/utils/validation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!isValidEmail(email)) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }

    setIsLoading(true);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setIsLoading(false);

    if (resetError) {
      setError('No se pudo enviar el correo de recuperación. Inténtalo nuevamente.');
      return;
    }

    setSuccessMessage('✓ Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <GraduationCap className="h-8 w-8 text-brand-600" />
          <h1 className="text-xl font-semibold text-slate-900">Recuperar contraseña</h1>
          <p className="text-sm text-slate-500">Te enviaremos un enlace a tu correo</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">✗ {error}</p>}
          {successMessage && (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</p>
          )}

          <Input
            id="email"
            type="email"
            label="Correo electrónico"
            placeholder="tucorreo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <Button type="submit" isLoading={isLoading} className="mt-1 w-full">
            Enviar instrucciones
          </Button>
        </form>

        <Link
          href="/login"
          className="mt-6 flex items-center justify-center gap-1 text-sm font-medium text-brand-600 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver a iniciar sesión
        </Link>
      </div>
    </div>
  );
}
