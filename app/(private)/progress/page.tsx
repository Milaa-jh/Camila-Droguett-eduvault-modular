'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { BarChart3, Target, ClipboardCheck, TrendingUp, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SubjectProgressCard } from '@/components/progress/SubjectProgressCard';
import type { SubjectProgress } from '@/types/database';

interface RecentAttempt {
  id: string;
  percentage: number;
  score: number;
  total_questions: number;
  completed_at: string;
  testTitle: string;
  subjectId: string;
  unitId: string;
  testId: string;
}

export default function ProgressPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [subjectsProgress, setSubjectsProgress] = useState<SubjectProgress[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<RecentAttempt[]>([]);
  const [overall, setOverall] = useState({ testsCompleted: 0, averagePercentage: 0, subjectsCount: 0 });

  const load = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: subjects } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    const subjectList = subjects ?? [];

    const { data: units } = await supabase
      .from('units')
      .select('id, subject_id')
      .in('subject_id', subjectList.map((s) => s.id).length ? subjectList.map((s) => s.id) : ['00000000-0000-0000-0000-000000000000']);

    const unitList = units ?? [];
    const unitIds = unitList.map((u) => u.id);

    const { data: tests } = unitIds.length
      ? await supabase.from('tests').select('id, unit_id, title').in('unit_id', unitIds)
      : { data: [] };

    const testList = tests ?? [];
    const testIds = testList.map((t) => t.id);

    const { data: attempts } = testIds.length
      ? await supabase
          .from('test_attempts')
          .select('id, test_id, score, total_questions, percentage, completed_at')
          .eq('user_id', user.id)
          .in('test_id', testIds)
          .order('completed_at', { ascending: false })
      : { data: [] };

    const attemptList = attempts ?? [];

    // Progreso por asignatura
    const progress: SubjectProgress[] = subjectList.map((subject) => {
      const subjectUnitIds = unitList.filter((u) => u.subject_id === subject.id).map((u) => u.id);
      const subjectTestIds = testList.filter((t) => subjectUnitIds.includes(t.unit_id)).map((t) => t.id);
      const subjectAttempts = attemptList.filter((a) => subjectTestIds.includes(a.test_id));

      const averagePercentage =
        subjectAttempts.length > 0
          ? Math.round(subjectAttempts.reduce((sum, a) => sum + Number(a.percentage), 0) / subjectAttempts.length)
          : 0;

      return {
        subject,
        unitsCount: subjectUnitIds.length,
        testsCompleted: subjectAttempts.length,
        averagePercentage,
      };
    });
    setSubjectsProgress(progress);

    // Estadísticas generales
    const overallAverage =
      attemptList.length > 0
        ? Math.round(attemptList.reduce((sum, a) => sum + Number(a.percentage), 0) / attemptList.length)
        : 0;
    setOverall({
      testsCompleted: attemptList.length,
      averagePercentage: overallAverage,
      subjectsCount: subjectList.length,
    });

    // Últimos 8 intentos, con contexto de navegación
    const testMap = new Map(testList.map((t) => [t.id, t]));
    const unitMap = new Map(unitList.map((u) => [u.id, u]));

    const recent: RecentAttempt[] = attemptList.slice(0, 8).map((a) => {
      const relatedTest = testMap.get(a.test_id);
      const relatedUnit = relatedTest ? unitMap.get(relatedTest.unit_id) : undefined;
      return {
        id: a.id,
        percentage: Number(a.percentage),
        score: a.score,
        total_questions: a.total_questions,
        completed_at: a.completed_at,
        testTitle: relatedTest?.title ?? 'Test',
        subjectId: relatedUnit?.subject_id ?? '',
        unitId: relatedTest?.unit_id ?? '',
        testId: a.test_id,
      };
    });
    setRecentAttempts(recent);

    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const stats = [
    { label: 'Asignaturas', value: overall.subjectsCount, icon: BarChart3 },
    { label: 'Tests rendidos', value: overall.testsCompleted, icon: ClipboardCheck },
    { label: 'Promedio general', value: overall.testsCompleted > 0 ? `${overall.averagePercentage}%` : '—', icon: Target },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Mi progreso</h1>
        <p className="text-sm text-slate-500">Revisa tu desempeño en tests por asignatura.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="flex flex-col items-center gap-2 text-center">
            <Icon className="h-5 w-5 text-brand-600" />
            <span className="text-2xl font-semibold text-slate-900">{value}</span>
            <span className="text-xs text-slate-500">{label}</span>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="mb-3 font-semibold text-slate-900">Progreso por asignatura</h2>
        {subjectsProgress.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="Todavía no hay datos de progreso."
            description="Crea asignaturas y rinde tests para ver tu progreso aquí."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjectsProgress.map((p) => (
              <SubjectProgressCard key={p.subject.id} progress={p} />
            ))}
          </div>
        )}
      </div>

      {recentAttempts.length > 0 && (
        <div>
          <h2 className="mb-3 font-semibold text-slate-900">Últimos tests rendidos</h2>
          <div className="flex flex-col gap-2">
            {recentAttempts.map((a) => (
              <Link
                key={a.id}
                href={`/subjects/${a.subjectId}/units/${a.unitId}/tests/${a.testId}`}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm transition-colors hover:border-brand-200"
              >
                <div>
                  <p className="font-medium text-slate-800">{a.testTitle}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(a.completed_at).toLocaleDateString('es-CL', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    a.percentage >= 60 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {a.score}/{a.total_questions} · {a.percentage}%
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
