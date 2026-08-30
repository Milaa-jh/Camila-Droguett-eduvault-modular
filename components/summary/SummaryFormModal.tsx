'use client';

import { useState, FormEvent, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';
import { isNonEmpty } from '@/lib/utils/validation';
import type { Summary } from '@/types/database';

export interface SummaryFormValues {
  title: string;
  content: string;
}

interface SummaryFormModalProps {
  open: boolean;
  initial?: Summary | null;
  isSaving?: boolean;
  onClose: () => void;
  onSubmit: (values: SummaryFormValues) => void;
}

export function SummaryFormModal({ open, initial, isSaving, onClose, onSubmit }: SummaryFormModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? '');
      setContent(initial?.content ?? '');
      setError('');
    }
  }, [open, initial]);

  if (!open) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isNonEmpty(title)) {
      setError('Debes ingresar un título para el resumen.');
      return;
    }
    if (!isNonEmpty(content)) {
      setError('El resumen no puede quedar vacío.');
      return;
    }
    onSubmit({ title: title.trim(), content: content.trim() });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">{initial ? 'Editar resumen' : 'Nuevo resumen'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">⚠ {error}</p>}

          <Input
            label="Título"
            placeholder="Resumen — Análisis exploratorio"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />

          <TextArea
            label="Contenido"
            placeholder="Escribe aquí tu resumen de estudio..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[220px]"
          />

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {initial ? 'Guardar cambios' : 'Crear resumen'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
