'use client';

import { useState, FormEvent } from 'react';
import { KeyRound, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { isValidPassword } from '@/lib/utils/validation';

export default function SettingsPage() {
  const { showToast } = useToast();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setError('');

    const check = isValidPassword(newPassword);
    if (!check.valid) {
      setError(check.message);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsSaving(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setIsSaving(false);

    if (updateError) {
      setError('No se pudo actualizar la contraseña. Inténtalo nuevamente.');
      return;
    }

    showToast('success', 'Contraseña actualizada correctamente.');
    setNewPassword('');
    setConfirmPassword('');
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Configuración</h1>
        <p className="text-sm text-slate-500">Administra la seguridad de tu cuenta.</p>
      </div>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-brand-600" />
          <h2 className="font-semibold text-slate-900">Cambiar contraseña</h2>
        </div>

        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
          {error && <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">⚠ {error}</p>}

          <Input
            type="password"
            label="Nueva contraseña"
            placeholder="Mínimo 8 caracteres, con letras y números"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
          <Input
            type="password"
            label="Confirmar nueva contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />

          <div className="flex justify-end">
            <Button type="submit" isLoading={isSaving}>
              Actualizar contraseña
            </Button>
          </div>
        </form>
      </Card>

      <Card className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-slate-400" />
          <h2 className="font-semibold text-slate-900">¿Necesitas ayuda?</h2>
        </div>
        <p className="text-sm text-slate-500">
          Si deseas eliminar tu cuenta o tienes algún problema con tu acceso, contacta al equipo
          de soporte de EduVault.
        </p>
      </Card>
    </div>
  );
}
