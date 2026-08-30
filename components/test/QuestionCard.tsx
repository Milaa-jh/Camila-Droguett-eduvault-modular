'use client';

import { Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import type { Question, QuestionOption } from '@/types/database';

interface QuestionCardProps {
  index: number;
  question: Question & { options: QuestionOption[] };
  onEdit: () => void;
  onDelete: () => void;
}

export function QuestionCard({ index, question, onEdit, onDelete }: QuestionCardProps) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-brand-200">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-slate-800">
          <span className="text-slate-400">{index + 1}.</span> {question.question_text}
        </p>
        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={onEdit}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Editar pregunta"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
            aria-label="Eliminar pregunta"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
        {question.options.map((option, i) => (
          <div
            key={option.id}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
              option.is_correct
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-slate-100 bg-slate-50 text-slate-600'
            }`}
          >
            <span className="font-semibold">{String.fromCharCode(65 + i)}.</span>
            <span className="flex-1">{option.option_text}</span>
            {option.is_correct && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />}
          </div>
        ))}
      </div>
    </div>
  );
}
