'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Layers, Loader2, Pencil } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { SubjectFormModal, type SubjectFormValues } from '@/components/subject/SubjectFormModal';
import { UnitFormModal, type UnitFormValues } from '@/components/unit/UnitFormModal';
import { UnitListItem } from '@/components/unit/UnitListItem';
import type { Subject, Unit } from '@/types/database';

export default function SubjectDetailPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const router = useRouter();
  const { showToast } = useToast();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [isSavingSubject, setIsSavingSubject] = useState(false);

  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isSavingUnit, setIsSavingUnit] = useState(false);
  const [deletingUnit, setDeletingUnit] = useState<Unit | null>(null);
  const [isDeletingUnit, setIsDeletingUnit] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();

    const { data: subjectData, error: subjectError } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', subjectId)
      .single();

    if (subjectError || !subjectData) {
      showToast('error', 'No se encontró la asignatura.');
      router.push('/subjects');
      return;
    }
    setSubject(subjectData);

    const { data: unitsData } = await supabase
      .from('units')
      .select('*')
      .eq('subject_id', subjectId)
      .order('unit_order', { ascending: true });

    setUnits(unitsData ?? []);
    setIsLoading(false);
  }, [subjectId, router, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleEditSubject(values: SubjectFormValues) {
    if (!subject) return;
    setIsSavingSubject(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('subjects')
      .update({
        name: values.name,
        code: values.code || null,
        description: values.description || null,
        color: values.color,
      })
      .eq('id', subject.id);

    setIsSavingSubject(false);
    if (error) {
      showToast('error', 'No se pudo guardar la información.');
      return;
    }
    showToast('success', 'Asignatura actualizada correctamente.');
    setSubjectModalOpen(false);
    load();
  }

  function openCreateUnit() {
    setEditingUnit(null);
    setUnitModalOpen(true);
  }

  function openEditUnit(unit: Unit) {
    setEditingUnit(unit);
    setUnitModalOpen(true);
  }

  async function handleSubmitUnit(values: UnitFormValues) {
    setIsSavingUnit(true);
    const supabase = createClient();

    if (editingUnit) {
      const { error } = await supabase
        .from('units')
        .update({ name: values.name, description: values.description || null })
        .eq('id', editingUnit.id);

      setIsSavingUnit(false);
      if (error) {
        showToast('error', 'No se pudo guardar la información.');
        return;
      }
      showToast('success', 'Unidad actualizada correctamente.');
    } else {
      const nextOrder = units.length > 0 ? Math.max(...units.map((u) => u.unit_order)) + 1 : 1;
      const { error } = await supabase.from('units').insert({
        subject_id: subjectId,
        name: values.name,
        description: values.description || null,
        unit_order: nextOrder,
      });

      setIsSavingUnit(false);
      if (error) {
        showToast('error', 'No se pudo guardar la información.');
        return;
      }
      showToast('success', 'Unidad creada correctamente.');
    }

    setUnitModalOpen(false);
    load();
  }

  async function handleDeleteUnit() {
    if (!deletingUnit) return;
    setIsDeletingUnit(true);
    const supabase = createClient();
    const { error } = await supabase.from('units').delete().eq('id', deletingUnit.id);
    setIsDeletingUnit(false);

    if (error) {
      showToast('error', 'No se pudo eliminar la unidad.');
      return;
    }
    showToast('success', 'Unidad eliminada.');
    setDeletingUnit(null);
    load();
  }

  async function swapUnitOrder(unitA: Unit, unitB: Unit) {
    const supabase = createClient();
    await Promise.all([
      supabase.from('units').update({ unit_order: unitB.unit_order }).eq('id', unitA.id),
      supabase.from('units').update({ unit_order: unitA.unit_order }).eq('id', unitB.id),
    ]);
    load();
  }

  if (isLoading || !subject) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/subjects" className="flex w-fit items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-3.5 w-3.5" /> Mis asignaturas
      </Link>

      <div className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: subject.color ?? '#3466ff' }}
            />
            <h1 className="text-xl font-semibold text-slate-900">{subject.name}</h1>
          </div>
          {subject.code && <p className="mt-1 text-xs font-medium text-slate-400">Código: {subject.code}</p>}
          {subject.description && <p className="mt-2 text-sm text-slate-500">{subject.description}</p>}
        </div>
        <Button variant="secondary" onClick={() => setSubjectModalOpen(true)} className="shrink-0 gap-1.5">
          <Pencil className="h-3.5 w-3.5" /> Editar
        </Button>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Unidades</h2>
          <Button onClick={openCreateUnit} className="gap-1.5">
            <Plus className="h-4 w-4" /> Nueva unidad
          </Button>
        </div>

        {units.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="Esta asignatura todavía no tiene unidades."
            description="Crea unidades para organizar el material, resúmenes y tests."
            action={
              <button onClick={openCreateUnit} className="text-sm font-medium text-brand-600 hover:underline">
                + Crear mi primera unidad
              </button>
            }
          />
        ) : (
          <div className="flex flex-col gap-2">
            {units.map((unit, index) => (
              <UnitListItem
                key={unit.id}
                unit={unit}
                subjectId={subjectId}
                isFirst={index === 0}
                isLast={index === units.length - 1}
                onMoveUp={() => index > 0 && swapUnitOrder(unit, units[index - 1])}
                onMoveDown={() => index < units.length - 1 && swapUnitOrder(unit, units[index + 1])}
                onEdit={() => openEditUnit(unit)}
                onDelete={() => setDeletingUnit(unit)}
              />
            ))}
          </div>
        )}
      </div>

      <SubjectFormModal
        open={subjectModalOpen}
        initial={subject}
        isSaving={isSavingSubject}
        onClose={() => setSubjectModalOpen(false)}
        onSubmit={handleEditSubject}
      />

      <UnitFormModal
        open={unitModalOpen}
        initial={editingUnit}
        isSaving={isSavingUnit}
        onClose={() => setUnitModalOpen(false)}
        onSubmit={handleSubmitUnit}
      />

      <ConfirmDialog
        open={!!deletingUnit}
        title="Eliminar unidad"
        description={`Se eliminará "${deletingUnit?.name}" junto con su material, resúmenes y tests. Esta acción no se puede deshacer.`}
        isLoading={isDeletingUnit}
        onConfirm={handleDeleteUnit}
        onCancel={() => setDeletingUnit(null)}
      />
    </div>
  );
}
