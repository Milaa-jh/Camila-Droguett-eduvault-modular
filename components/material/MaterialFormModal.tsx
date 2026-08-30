'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { X, Upload, File as FileIcon } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';
import { isNonEmpty, isValidUrl } from '@/lib/utils/validation';
import type { Material, MaterialType } from '@/types/database';

const TYPE_OPTIONS: { value: MaterialType; label: string; needsFile: boolean; needsUrl: boolean }[] = [
  { value: 'apunte', label: 'Apunte', needsFile: false, needsUrl: false },
  { value: 'texto', label: 'Texto', needsFile: false, needsUrl: false },
  { value: 'pdf', label: 'PDF', needsFile: true, needsUrl: false },
  { value: 'documento', label: 'Documento', needsFile: true, needsUrl: false },
  { value: 'enlace', label: 'Enlace', needsFile: false, needsUrl: true },
];

export interface MaterialFormValues {
  title: string;
  description: string;
  type: MaterialType;
  externalUrl: string;
  file: File | null;
  removeExistingFile: boolean;
}

interface MaterialFormModalProps {
  open: boolean;
  initial?: Material | null;
  isSaving?: boolean;
  onClose: () => void;
  onSubmit: (values: MaterialFormValues) => void;
}

export function MaterialFormModal({ open, initial, isSaving, onClose, onSubmit }: MaterialFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<MaterialType>('apunte');
  const [externalUrl, setExternalUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? '');
      setDescription(initial?.description ?? '');
      setType(initial?.type ?? 'apunte');
      setExternalUrl(initial?.external_url ?? '');
      setFile(null);
      setError('');
    }
  }, [open, initial]);

  if (!open) return null;

  const activeType = TYPE_OPTIONS.find((t) => t.value === type)!;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!isNonEmpty(title)) {
      setError('Debes ingresar un título para el material.');
      return;
    }
    if (activeType.needsUrl && !isValidUrl(externalUrl)) {
      setError('Ingresa una URL válida (debe comenzar con http:// o https://).');
      return;
    }
    if (activeType.needsFile && !file && !initial?.file_url) {
      setError('Debes seleccionar un archivo para este tipo de material.');
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      type,
      externalUrl: activeType.needsUrl ? externalUrl.trim() : '',
      file,
      removeExistingFile: !activeType.needsFile,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">{initial ? 'Editar material' : 'Nuevo material'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">⚠ {error}</p>}

          <div>
            <p className="mb-1.5 text-sm font-medium text-slate-700">Tipo</p>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setType(opt.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    type === opt.value
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Título"
            placeholder="Apuntes de introducción"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />

          <TextArea
            label="Descripción (opcional)"
            placeholder="Resumen de la primera clase."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {activeType.needsUrl && (
            <Input
              label="URL del enlace"
              placeholder="https://..."
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
            />
          )}

          {activeType.needsFile && (
            <div>
              <p className="mb-1.5 text-sm font-medium text-slate-700">Archivo</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3.5 py-3 text-sm text-slate-500 hover:border-brand-300 hover:bg-brand-50/50"
              >
                {file ? <FileIcon className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                {file
                  ? file.name
                  : initial?.file_url
                  ? 'Reemplazar archivo actual'
                  : 'Seleccionar archivo (PDF o documento)'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {initial ? 'Guardar cambios' : 'Agregar material'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
