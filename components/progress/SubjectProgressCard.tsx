import Link from 'next/link';
import type { SubjectProgress } from '@/types/database';

function getBarColor(percentage: number) {
  if (percentage >= 80) return '#22c55e';
  if (percentage >= 60) return '#3466ff';
  if (percentage >= 40) return '#f59e0b';
  return '#ef4444';
}

export function SubjectProgressCard({ progress }: { progress: SubjectProgress }) {
  const { subject, unitsCount, testsCompleted, averagePercentage } = progress;
  const hasAttempts = testsCompleted > 0;

  return (
    <Link
      href={`/subjects/${subject.id}`}
      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-brand-200"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: subject.color ?? '#3466ff' }}
          />
          <h3 className="font-semibold text-slate-900">{subject.name}</h3>
        </div>
        <span className="text-sm font-semibold text-slate-700">
          {hasAttempts ? `${averagePercentage}%` : '—'}
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        {hasAttempts && (
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${averagePercentage}%`, backgroundColor: getBarColor(averagePercentage) }}
          />
        )}
      </div>

      <p className="text-xs text-slate-400">
        {unitsCount} {unitsCount === 1 ? 'unidad' : 'unidades'} · {testsCompleted}{' '}
        {testsCompleted === 1 ? 'test rendido' : 'tests rendidos'}
      </p>
    </Link>
  );
}
