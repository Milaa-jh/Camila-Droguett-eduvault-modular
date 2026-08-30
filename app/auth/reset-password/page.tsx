'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { isValidPassword } from '@/lib/utils/validation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const check = isValidPassword(password);
    if (!check.valid) {
      setError(check.message);
      return;
    }

    setIsLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsLoading(false);

    if (updateError) {
      setError('No se pudo actualizar la contraseña. Solicita un nuevo enlace.');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <GraduationCap className="h-8 w-8 text-brand-600" />
          <h1 className="text-xl font-semibold text-slate-900">Nueva contraseña</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">✗ {error}</p>}

          <Input
            id="password"
            type="password"
            label="Nueva contraseña"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />

          <Button type="submit" isLoading={isLoading} className="mt-1 w-full">
            Guardar contraseña
          </Button>
        </form>
      </div>
    </div>
  );
}
