'use client';

import { useState } from 'react';
import { NotebookPen, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { Summary } from '@/types/database';

interface SummaryCardProps {
  summary: Summary;
  onEdit: () => void;
  onDelete: () => void;
}

export function SummaryCard({ summary, onEdit, onDelete }: SummaryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const content = summary.content ?? '';
  const isLong = content.length > 220;

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-brand-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-brand-50 p-2">
            <NotebookPen className="h-4 w-4 text-brand-600" />
          </div>
          <h3 className="font-medium text-slate-800">{summary.title}</h3>
        </div>
        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={onEdit}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Editar resumen"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
            aria-label="Eliminar resumen"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className={`mt-3 whitespace-pre-wrap text-sm text-slate-600 ${!expanded && isLong ? 'line-clamp-4' : ''}`}>
        {content}
      </p>

      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
        >
          {expanded ? (
            <>
              Ver menos <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              Ver más <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
