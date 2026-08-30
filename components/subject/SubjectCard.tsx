'use client';

import Link from 'next/link';
import { Pencil, Trash2, ChevronRight } from 'lucide-react';
import type { Subject } from '@/types/database';

interface SubjectCardProps {
  subject: Subject;
  onEdit: () => void;
  onDelete: () => void;
}

export function SubjectCard({ subject, onEdit, onDelete }: SubjectCardProps) {
  return (
    <div className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-brand-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: subject.color ?? '#3466ff' }}
          />
          <h3 className="font-semibold text-slate-900">{subject.name}</h3>
        </div>
        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={onEdit}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Editar asignatura"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
            aria-label="Eliminar asignatura"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {subject.code && <p className="text-xs font-medium text-slate-400">Código: {subject.code}</p>}
      {subject.description && (
        <p className="line-clamp-2 text-sm text-slate-500">{subject.description}</p>
      )}

      <Link
        href={`/subjects/${subject.id}`}
        className="mt-1 flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
      >
        Ver asignatura <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
