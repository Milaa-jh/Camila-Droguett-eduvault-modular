import Link from 'next/link';
import { BookOpen, Layers, FileText, ClipboardCheck, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single();

  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name, color')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  const subjectIds = (subjects ?? []).map((s) => s.id);

  let unitsCount = 0;
  let materialsCount = 0;
  let testsCount = 0;
  let averageScore = 0;

  if (subjectIds.length > 0) {
    const { data: units } = await supabase
      .from('units')
      .select('id')
      .in('subject_id', subjectIds);
    unitsCount = units?.length ?? 0;

    const unitIds = (units ?? []).map((u) => u.id);

    if (unitIds.length > 0) {
      const { count: matCount } = await supabase
        .from('materials')
        .select('id', { count: 'exact', head: true })
        .in('unit_id', unitIds);
      materialsCount = matCount ?? 0;

      const { count: testCount } = await supabase
        .from('tests')
        .select('id', { count: 'exact', head: true })
        .in('unit_id', unitIds);
      testsCount = testCount ?? 0;
    }
  }

  const { data: attempts } = await supabase
    .from('test_attempts')
    .select('percentage')
    .eq('user_id', user!.id);

  if (attempts && attempts.length > 0) {
    averageScore = Math.round(
      attempts.reduce((sum, a) => sum + Number(a.percentage), 0) / attempts.length
    );
  }

  const stats = [
    { label: 'Asignaturas', value: subjects?.length ?? 0, icon: BookOpen },
    { label: 'Unidades', value: unitsCount, icon: Layers },
    { label: 'Material', value: materialsCount, icon: FileText },
    { label: 'Tests realizados', value: attempts?.length ?? 0, icon: ClipboardCheck },
  ];

  const firstName = (profile?.full_name ?? 'Estudiante').split(' ')[0];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Hola, {firstName} 👋</h1>
        <p className="text-sm text-slate-500">
          {attempts && attempts.length > 0
            ? `Tu promedio general en tests es ${averageScore}%.`
            : 'Aquí tienes un resumen de tu actividad académica.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="flex flex-col items-center gap-2 text-center">
            <Icon className="h-5 w-5 text-brand-600" />
            <span className="text-2xl font-semibold text-slate-900">{value}</span>
            <span className="text-xs text-slate-500">{label}</span>
          </Card>
        ))}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Mis asignaturas</h2>
          <Link href="/subjects" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
            Ver todas <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {subjects && subjects.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {subjects.slice(0, 4).map((s) => (
              <Link
                key={s.id}
                href={`/subjects/${s.id}`}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm transition-colors hover:border-brand-200"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: s.color ?? '#3466ff' }}
                />
                <span className="text-sm font-medium text-slate-800">{s.name}</span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No tienes asignaturas todavía."
            description="Crea tu primera asignatura para empezar a organizar tu material académico."
            action={
              <Link href="/subjects" className="text-sm font-medium text-brand-600 hover:underline">
                + Crear mi primera asignatura
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
