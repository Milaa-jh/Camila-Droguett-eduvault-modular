'use client';

import Link from 'next/link';
import { ClipboardCheck, Pencil, Trash2, ChevronRight } from 'lucide-react';
import type { Test } from '@/types/database';

interface TestListItemProps {
  test: Test;
  questionCount: number;
  basePath: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function TestListItem({ test, questionCount, basePath, onEdit, onDelete }: TestListItemProps) {
  return (
    <div className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm transition-colors hover:border-brand-200">
      <div className="rounded-xl bg-brand-50 p-2">
        <ClipboardCheck className="h-4 w-4 text-brand-600" />
      </div>

      <Link href={`${basePath}/tests/${test.id}`} className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-800">{test.title}</p>
        <p className="text-xs text-slate-400">
          {questionCount} {questionCount === 1 ? 'pregunta' : 'preguntas'}
        </p>
      </Link>

      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={onEdit}
          className="rounded-lg p-1.5 text-slate-400 opacity-0 hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100"
          aria-label="Editar test"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="rounded-lg p-1.5 text-slate-400 opacity-0 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
          aria-label="Eliminar test"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <Link
          href={`${basePath}/tests/${test.id}`}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Gestionar preguntas"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
