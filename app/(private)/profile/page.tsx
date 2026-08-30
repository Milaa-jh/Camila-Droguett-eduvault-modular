'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Camera, Loader2, Mail, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { uploadAvatar } from '@/lib/supabase/avatar';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/profile/Avatar';
import { useToast } from '@/components/ui/Toast';
import { isNonEmpty } from '@/lib/utils/validation';
import type { Profile } from '@/types/database';

export default function ProfilePage() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [fullName, setFullName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stats, setStats] = useState({ subjects: 0, tests: 0 });

  const load = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (profileData) {
      setProfile(profileData);
      setFullName(profileData.full_name);
    }

    const { count: subjectsCount } = await supabase
      .from('subjects')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { count: testsCount } = await supabase
      .from('test_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    setStats({ subjects: subjectsCount ?? 0, tests: testsCount ?? 0 });
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSaveName() {
    if (!profile) return;
    if (!isNonEmpty(fullName)) {
      showToast('warning', 'El nombre no puede quedar vacío.');
      return;
    }

    setIsSavingName(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', profile.id);
    setIsSavingName(false);

    if (error) {
      showToast('error', 'No se pudo actualizar tu nombre.');
      return;
    }
    showToast('success', 'Nombre actualizado correctamente.');
    load();
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (!file.type.startsWith('image/')) {
      showToast('warning', 'Selecciona un archivo de imagen válido.');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      showToast('warning', 'La imagen no puede superar los 3 MB.');
      return;
    }

    setIsUploadingAvatar(true);
    const { url, error } = await uploadAvatar(profile.id, file);
    setIsUploadingAvatar(false);

    if (error || !url) {
      showToast('error', 'No se pudo subir la imagen. Revisa que el bucket "avatars" exista y sea público.');
      return;
    }

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: url })
      .eq('id', profile.id);

    if (updateError) {
      showToast('error', 'No se pudo guardar la foto de perfil.');
      return;
    }
    showToast('success', 'Foto de perfil actualizada.');
    load();
  }

  if (isLoading || !profile) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Mi perfil</h1>
        <p className="text-sm text-slate-500">Administra tu información personal.</p>
      </div>

      <Card className="flex flex-col items-center gap-4 py-8 text-center sm:flex-row sm:text-left">
        <div className="relative">
          <Avatar name={profile.full_name} url={profile.avatar_url} size={88} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-600 text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
            aria-label="Cambiar foto de perfil"
          >
            {isUploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-lg font-semibold text-slate-900">{profile.full_name}</p>
          <p className="flex items-center justify-center gap-1.5 text-sm text-slate-500 sm:justify-start">
            <Mail className="h-3.5 w-3.5" /> {profile.email}
          </p>
          <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400 sm:justify-start">
            <Calendar className="h-3 w-3" />
            Miembro desde{' '}
            {new Date(profile.created_at).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col items-center gap-1 text-center">
          <span className="text-2xl font-semibold text-slate-900">{stats.subjects}</span>
          <span className="text-xs text-slate-500">Asignaturas creadas</span>
        </Card>
        <Card className="flex flex-col items-center gap-1 text-center">
          <span className="text-2xl font-semibold text-slate-900">{stats.tests}</span>
          <span className="text-xs text-slate-500">Tests rendidos</span>
        </Card>
      </div>

      <Card className="flex flex-col gap-4">
        <h2 className="font-semibold text-slate-900">Información personal</h2>
        <Input
          label="Nombre completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Input label="Correo electrónico" value={profile.email} disabled className="cursor-not-allowed opacity-70" />
        <div className="flex justify-end">
          <Button onClick={handleSaveName} isLoading={isSavingName} disabled={fullName.trim() === profile.full_name}>
            Guardar cambios
          </Button>
        </div>
      </Card>
    </div>
  );
}
