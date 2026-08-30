'use client';

import Link from 'next/link';
import { ClipboardCheck, ChevronRight } from 'lucide-react';

interface GlobalTestCardProps {
  href: string;
  title: string;
  subjectName: string;
  subjectColor: string | null;
  unitName: string;
  questionCount: number;
  lastPercentage: number | null;
}

export function GlobalTestCard({
  href,
  title,
  subjectName,
  subjectColor,
  unitName,
  questionCount,
  lastPercentage,
}: GlobalTestCardProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm transition-colors hover:border-brand-200"
    >
      <div className="rounded-xl bg-brand-50 p-2">
        <ClipboardCheck className="h-4 w-4 text-brand-600" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-800">{title}</p>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: subjectColor ?? '#3466ff' }} />
          <span className="truncate">
            {subjectName} · {unitName}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="text-xs text-slate-400">
          {questionCount} {questionCount === 1 ? 'pregunta' : 'preguntas'}
        </span>
        {lastPercentage !== null && (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              lastPercentage >= 60 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}
          >
            {lastPercentage}%
          </span>
        )}
        <ChevronRight className="h-4 w-4 text-slate-300" />
      </div>
    </Link>
  );
}
