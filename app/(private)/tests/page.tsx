'use client';

import { useEffect, useState, useCallback } from 'react';
import { ClipboardCheck, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { EmptyState } from '@/components/ui/EmptyState';
import { GlobalTestCard } from '@/components/test/GlobalTestCard';

interface TestRow {
  id: string;
  title: string;
  unit_id: string;
  unitName: string;
  subjectId: string;
  subjectName: string;
  subjectColor: string | null;
  questionCount: number;
  lastPercentage: number | null;
}

interface SubjectGroup {
  subjectId: string;
  subjectName: string;
  subjectColor: string | null;
  tests: TestRow[];
}

export default function TestsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState<SubjectGroup[]>([]);

  const load = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: subjects } = await supabase
      .from('subjects')
      .select('id, name, color')
      .eq('user_id', user.id);
    const subjectList = subjects ?? [];
    const subjectIds = subjectList.map((s) => s.id);

    if (subjectIds.length === 0) {
      setGroups([]);
      setIsLoading(false);
      return;
    }

    const { data: units } = await supabase
      .from('units')
      .select('id, name, subject_id')
      .in('subject_id', subjectIds);
    const unitList = units ?? [];
    const unitIds = unitList.map((u) => u.id);

    if (unitIds.length === 0) {
      setGroups([]);
      setIsLoading(false);
      return;
    }

    const { data: tests } = await supabase
      .from('tests')
      .select('id, title, unit_id, created_at')
      .in('unit_id', unitIds)
      .order('created_at', { ascending: false });
    const testList = tests ?? [];
    const testIds = testList.map((t) => t.id);

    const [questionsRes, attemptsRes] = await Promise.all([
      testIds.length
        ? supabase.from('questions').select('id, test_id').in('test_id', testIds)
        : Promise.resolve({ data: [] as { id: string; test_id: string }[] }),
      testIds.length
        ? supabase
            .from('test_attempts')
            .select('test_id, percentage, completed_at')
            .eq('user_id', user.id)
            .in('test_id', testIds)
            .order('completed_at', { ascending: false })
        : Promise.resolve({ data: [] as { test_id: string; percentage: number; completed_at: string }[] }),
    ]);

    const questionCounts: Record<string, number> = {};
    (questionsRes.data ?? []).forEach((q) => {
      questionCounts[q.test_id] = (questionCounts[q.test_id] ?? 0) + 1;
    });

    const lastAttemptByTest: Record<string, number> = {};
    (attemptsRes.data ?? []).forEach((a) => {
      if (!(a.test_id in lastAttemptByTest)) {
        lastAttemptByTest[a.test_id] = Number(a.percentage);
      }
    });

    const unitMap = new Map(unitList.map((u) => [u.id, u]));
    const subjectMap = new Map(subjectList.map((s) => [s.id, s]));

    const rows: TestRow[] = testList.map((t) => {
      const unit = unitMap.get(t.unit_id);
      const subject = unit ? subjectMap.get(unit.subject_id) : undefined;
      return {
        id: t.id,
        title: t.title,
        unit_id: t.unit_id,
        unitName: unit?.name ?? '—',
        subjectId: subject?.id ?? '',
        subjectName: subject?.name ?? '—',
        subjectColor: subject?.color ?? null,
        questionCount: questionCounts[t.id] ?? 0,
        lastPercentage: lastAttemptByTest[t.id] ?? null,
      };
    });

    const groupedMap = new Map<string, SubjectGroup>();
    rows.forEach((row) => {
      if (!groupedMap.has(row.subjectId)) {
        groupedMap.set(row.subjectId, {
          subjectId: row.subjectId,
          subjectName: row.subjectName,
          subjectColor: row.subjectColor,
          tests: [],
        });
      }
      groupedMap.get(row.subjectId)!.tests.push(row);
    });

    setGroups(Array.from(groupedMap.values()));
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

  const totalTests = groups.reduce((sum, g) => sum + g.tests.length, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Tests</h1>
        <p className="text-sm text-slate-500">Todos tus tests de autoevaluación, en un solo lugar.</p>
      </div>

      {totalTests === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="Todavía no has creado ningún test."
          description="Entra a una unidad dentro de tus asignaturas y crea tu primer test desde la pestaña 'Tests'."
        />
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map((group) => (
            <div key={group.subjectId}>
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: group.subjectColor ?? '#3466ff' }}
                />
                <h2 className="font-semibold text-slate-900">{group.subjectName}</h2>
              </div>
              <div className="flex flex-col gap-2">
                {group.tests.map((test) => (
                  <GlobalTestCard
                    key={test.id}
                    href={`/subjects/${test.subjectId}/units/${test.unit_id}/tests/${test.id}`}
                    title={test.title}
                    subjectName={test.subjectName}
                    subjectColor={test.subjectColor}
                    unitName={test.unitName}
                    questionCount={test.questionCount}
                    lastPercentage={test.lastPercentage}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
