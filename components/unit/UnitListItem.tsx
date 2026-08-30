'use client';

import Link from 'next/link';
import { ChevronUp, ChevronDown, Pencil, Trash2, ChevronRight } from 'lucide-react';
import type { Unit } from '@/types/database';

interface UnitListItemProps {
  unit: Unit;
  subjectId: string;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function UnitListItem({
  unit,
  subjectId,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: UnitListItemProps) {
  return (
    <div className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm transition-colors hover:border-brand-200">
      <div className="flex flex-col text-slate-300">
        <button
          onClick={onMoveUp}
          disabled={isFirst}
          className="hover:text-slate-600 disabled:opacity-30"
          aria-label="Mover arriba"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          onClick={onMoveDown}
          disabled={isLast}
          className="hover:text-slate-600 disabled:opacity-30"
          aria-label="Mover abajo"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <Link href={`/subjects/${subjectId}/units/${unit.id}`} className="flex-1 min-w-0">
        <p className="truncate font-medium text-slate-800">
          Unidad {unit.unit_order} — {unit.name}
        </p>
        {unit.description && (
          <p className="truncate text-sm text-slate-500">{unit.description}</p>
        )}
      </Link>

      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={onEdit}
          className="rounded-lg p-1.5 text-slate-400 opacity-0 hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100"
          aria-label="Editar unidad"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="rounded-lg p-1.5 text-slate-400 opacity-0 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
          aria-label="Eliminar unidad"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <Link
          href={`/subjects/${subjectId}/units/${unit.id}`}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Acceder a unidad"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
