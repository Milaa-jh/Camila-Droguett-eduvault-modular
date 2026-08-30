'use client';

import { useState, FormEvent, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';
import { isNonEmpty } from '@/lib/utils/validation';
import type { Subject } from '@/types/database';

const COLOR_OPTIONS = [
  '#3466ff', '#22c55e', '#f59e0b', '#a855f7', '#ef4444', '#0ea5e9', '#ec4899', '#14b8a6',
];

export interface SubjectFormValues {
  name: string;
  code: string;
  description: string;
  color: string;
}

interface SubjectFormModalProps {
  open: boolean;
  initial?: Subject | null;
  isSaving?: boolean;
  onClose: () => void;
  onSubmit: (values: SubjectFormValues) => void;
}

export function SubjectFormModal({ open, initial, isSaving, onClose, onSubmit }: SubjectFormModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? '');
      setCode(initial?.code ?? '');
      setDescription(initial?.description ?? '');
      setColor(initial?.color ?? COLOR_OPTIONS[0]);
      setError('');
    }
  }, [open, initial]);

  if (!open) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isNonEmpty(name)) {
      setError('Debes ingresar un nombre para la asignatura.');
      return;
    }
    onSubmit({ name: name.trim(), code: code.trim(), description: description.trim(), color });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">
            {initial ? 'Editar asignatura' : 'Nueva asignatura'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">⚠ {error}</p>}

          <Input
            label="Nombre"
            placeholder="Minería de Datos"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          <Input
            label="Código (opcional)"
            placeholder="BLY7121"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <TextArea
            label="Descripción (opcional)"
            placeholder="Análisis de datos y modelos predictivos."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div>
            <p className="mb-1.5 text-sm font-medium text-slate-700">Color</p>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className="h-7 w-7 rounded-full ring-offset-2 transition"
                  style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 2px ${c}` : 'none' }}
                  aria-label={`Elegir color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {initial ? 'Guardar cambios' : 'Crear asignatura'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
