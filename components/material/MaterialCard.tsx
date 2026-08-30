'use client';

import { useState } from 'react';
import { FileText, Link as LinkIcon, File as FileIcon, Pencil, Trash2, Download, Loader2 } from 'lucide-react';
import { getMaterialSignedUrl } from '@/lib/supabase/storage';
import type { Material } from '@/types/database';

const TYPE_META: Record<string, { icon: typeof FileText; label: string }> = {
  apunte: { icon: FileText, label: 'Apunte' },
  texto: { icon: FileText, label: 'Texto' },
  pdf: { icon: FileIcon, label: 'PDF' },
  documento: { icon: FileIcon, label: 'Documento' },
  enlace: { icon: LinkIcon, label: 'Enlace' },
};

interface MaterialCardProps {
  material: Material;
  onEdit: () => void;
  onDelete: () => void;
}

export function MaterialCard({ material, onEdit, onDelete }: MaterialCardProps) {
  const [isOpening, setIsOpening] = useState(false);
  const meta = TYPE_META[material.type] ?? TYPE_META.apunte;
  const Icon = meta.icon;

  async function handleOpen() {
    if (material.external_url) {
      window.open(material.external_url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (material.file_url) {
      setIsOpening(true);
      const url = await getMaterialSignedUrl(material.file_url);
      setIsOpening(false);
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  const canOpen = !!material.external_url || !!material.file_url;

  return (
    <div className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-brand-200">
      <div className="mt-0.5 rounded-xl bg-brand-50 p-2">
        <Icon className="h-4 w-4 text-brand-600" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium text-slate-800">{material.title}</p>
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
            {meta.label}
          </span>
        </div>
        {material.description && (
          <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">{material.description}</p>
        )}

        {canOpen && (
          <button
            onClick={handleOpen}
            disabled={isOpening}
            className="mt-2 flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline disabled:opacity-60"
          >
            {isOpening ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
            {material.external_url ? 'Abrir enlace' : 'Descargar archivo'}
          </button>
        )}
      </div>

      <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={onEdit}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Editar material"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
          aria-label="Eliminar material"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
