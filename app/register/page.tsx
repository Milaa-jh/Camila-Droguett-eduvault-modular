'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { isValidEmail, isValidPassword, isNonEmpty } from '@/lib/utils/validation';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string }>({});
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function validate() {
    const next: typeof errors = {};
    if (!isNonEmpty(fullName)) next.fullName = 'Ingresa tu nombre completo.';
    if (!isValidEmail(email)) next.email = 'Ingresa un correo electrónico válido.';
    const passwordCheck = isValidPassword(password);
    if (!passwordCheck.valid) next.password = passwordCheck.message;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');
    if (!validate()) return;

    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setIsLoading(false);

    if (error) {
      setFormError(error.message === 'User already registered'
        ? 'Ya existe una cuenta con este correo.'
        : 'No se pudo completar el registro. Inténtalo nuevamente.');
      return;
    }

    setSuccessMessage('✓ Cuenta creada correctamente. Revisa tu correo para confirmarla.');
    setTimeout(() => router.push('/login'), 2500);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <GraduationCap className="h-8 w-8 text-brand-600" />
          <h1 className="text-xl font-semibold text-slate-900">Crea tu cuenta en EduVault</h1>
          <p className="text-sm text-slate-500">Empieza a organizar tus estudios hoy</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {formError && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">✗ {formError}</p>
          )}
          {successMessage && (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</p>
          )}

          <Input
            id="fullName"
            type="text"
            label="Nombre completo"
            placeholder="Camila Droguett"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={errors.fullName}
            autoComplete="name"
          />

          <Input
            id="email"
            type="email"
            label="Correo electrónico"
            placeholder="tucorreo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
          />

          <Input
            id="password"
            type="password"
            label="Contraseña"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="new-password"
          />

          <Button type="submit" isLoading={isLoading} className="mt-1 w-full">
            Crear cuenta
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
