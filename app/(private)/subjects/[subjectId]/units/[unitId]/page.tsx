'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, FileText, Loader2, NotebookPen, ClipboardCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { uploadMaterialFile, deleteMaterialFile } from '@/lib/supabase/storage';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Tabs } from '@/components/ui/Tabs';
import { useToast } from '@/components/ui/Toast';
import { MaterialFormModal, type MaterialFormValues } from '@/components/material/MaterialFormModal';
import { MaterialCard } from '@/components/material/MaterialCard';
import { SummaryFormModal, type SummaryFormValues } from '@/components/summary/SummaryFormModal';
import { SummaryCard } from '@/components/summary/SummaryCard';
import { TestFormModal, type TestFormValues } from '@/components/test/TestFormModal';
import { TestListItem } from '@/components/test/TestListItem';
import type { Unit, Material, Summary, Test } from '@/types/database';

export default function UnitDetailPage() {
  const { subjectId, unitId } = useParams<{ subjectId: string; unitId: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const basePath = `/subjects/${subjectId}/units/${unitId}`;

  const [unit, setUnit] = useState<Unit | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('material');

  // --- Material ---
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [isSavingMaterial, setIsSavingMaterial] = useState(false);
  const [deletingMaterial, setDeletingMaterial] = useState<Material | null>(null);
  const [isDeletingMaterial, setIsDeletingMaterial] = useState(false);

  // --- Resúmenes ---
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [editingSummary, setEditingSummary] = useState<Summary | null>(null);
  const [isSavingSummary, setIsSavingSummary] = useState(false);
  const [deletingSummary, setDeletingSummary] = useState<Summary | null>(null);
  const [isDeletingSummary, setIsDeletingSummary] = useState(false);

  // --- Tests ---
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [isSavingTest, setIsSavingTest] = useState(false);
  const [deletingTest, setDeletingTest] = useState<Test | null>(null);
  const [isDeletingTest, setIsDeletingTest] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();

    const { data: unitData, error: unitError } = await supabase
      .from('units')
      .select('*')
      .eq('id', unitId)
      .single();

    if (unitError || !unitData) {
      showToast('error', 'No se encontró la unidad.');
      router.push(`/subjects/${subjectId}`);
      return;
    }
    setUnit(unitData);

    const [materialsRes, summariesRes, testsRes] = await Promise.all([
      supabase.from('materials').select('*').eq('unit_id', unitId).order('created_at', { ascending: false }),
      supabase.from('summaries').select('*').eq('unit_id', unitId).order('created_at', { ascending: false }),
      supabase.from('tests').select('*').eq('unit_id', unitId).order('created_at', { ascending: false }),
    ]);

    setMaterials(materialsRes.data ?? []);
    setSummaries(summariesRes.data ?? []);
    const testsData = testsRes.data ?? [];
    setTests(testsData);

    if (testsData.length > 0) {
      const { data: questionsData } = await supabase
        .from('questions')
        .select('id, test_id')
        .in('test_id', testsData.map((t) => t.id));

      const counts: Record<string, number> = {};
      (questionsData ?? []).forEach((q) => {
        counts[q.test_id] = (counts[q.test_id] ?? 0) + 1;
      });
      setQuestionCounts(counts);
    } else {
      setQuestionCounts({});
    }

    setIsLoading(false);
  }, [unitId, subjectId, router, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  // ---------------- Material ----------------

  function openCreateMaterial() {
    setEditingMaterial(null);
    setMaterialModalOpen(true);
  }

  async function handleSubmitMaterial(values: MaterialFormValues) {
    setIsSavingMaterial(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    let filePath: string | null = editingMaterial?.file_url ?? null;

    if (values.file) {
      const { path, error: uploadError } = await uploadMaterialFile(user.id, unitId, values.file);
      if (uploadError || !path) {
        setIsSavingMaterial(false);
        showToast('error', 'No se pudo subir el archivo. Inténtalo nuevamente.');
        return;
      }
      if (editingMaterial?.file_url) await deleteMaterialFile(editingMaterial.file_url);
      filePath = path;
    } else if (values.removeExistingFile && editingMaterial?.file_url) {
      await deleteMaterialFile(editingMaterial.file_url);
      filePath = null;
    }

    const payload = {
      title: values.title,
      description: values.description || null,
      type: values.type,
      external_url: values.externalUrl || null,
      file_url: values.removeExistingFile ? null : filePath,
    };

    const { error } = editingMaterial
      ? await supabase.from('materials').update(payload).eq('id', editingMaterial.id)
      : await supabase.from('materials').insert({ ...payload, unit_id: unitId });

    setIsSavingMaterial(false);
    if (error) {
      showToast('error', 'No se pudo guardar el material.');
      return;
    }
    showToast('success', editingMaterial ? 'Material actualizado correctamente.' : 'Material agregado correctamente.');
    setMaterialModalOpen(false);
    load();
  }

  async function handleDeleteMaterial() {
    if (!deletingMaterial) return;
    setIsDeletingMaterial(true);
    const supabase = createClient();
    if (deletingMaterial.file_url) await deleteMaterialFile(deletingMaterial.file_url);
    const { error } = await supabase.from('materials').delete().eq('id', deletingMaterial.id);
    setIsDeletingMaterial(false);

    if (error) {
      showToast('error', 'No se pudo eliminar el material.');
      return;
    }
    showToast('success', 'Material eliminado.');
    setDeletingMaterial(null);
    load();
  }

  // ---------------- Resúmenes ----------------

  function openCreateSummary() {
    setEditingSummary(null);
    setSummaryModalOpen(true);
  }

  async function handleSubmitSummary(values: SummaryFormValues) {
    setIsSavingSummary(true);
    const supabase = createClient();

    const { error } = editingSummary
      ? await supabase
          .from('summaries')
          .update({ title: values.title, content: values.content })
          .eq('id', editingSummary.id)
      : await supabase.from('summaries').insert({ unit_id: unitId, title: values.title, content: values.content });

    setIsSavingSummary(false);
    if (error) {
      showToast('error', 'No se pudo guardar el resumen.');
      return;
    }
    showToast('success', editingSummary ? 'Resumen actualizado correctamente.' : 'Resumen creado correctamente.');
    setSummaryModalOpen(false);
    load();
  }

  async function handleDeleteSummary() {
    if (!deletingSummary) return;
    setIsDeletingSummary(true);
    const supabase = createClient();
    const { error } = await supabase.from('summaries').delete().eq('id', deletingSummary.id);
    setIsDeletingSummary(false);

    if (error) {
      showToast('error', 'No se pudo eliminar el resumen.');
      return;
    }
    showToast('success', 'Resumen eliminado.');
    setDeletingSummary(null);
    load();
  }

  // ---------------- Tests ----------------

  function openCreateTest() {
    setEditingTest(null);
    setTestModalOpen(true);
  }

  async function handleSubmitTest(values: TestFormValues) {
    setIsSavingTest(true);
    const supabase = createClient();

    const { error } = editingTest
      ? await supabase
          .from('tests')
          .update({ title: values.title, description: values.description || null })
          .eq('id', editingTest.id)
      : await supabase
          .from('tests')
          .insert({ unit_id: unitId, title: values.title, description: values.description || null });

    setIsSavingTest(false);
    if (error) {
      showToast('error', 'No se pudo guardar el test.');
      return;
    }
    showToast('success', editingTest ? 'Test actualizado correctamente.' : 'Test creado correctamente.');
    setTestModalOpen(false);
    load();
  }

  async function handleDeleteTest() {
    if (!deletingTest) return;
    setIsDeletingTest(true);
    const supabase = createClient();
    const { error } = await supabase.from('tests').delete().eq('id', deletingTest.id);
    setIsDeletingTest(false);

    if (error) {
      showToast('error', 'No se pudo eliminar el test.');
      return;
    }
    showToast('success', 'Test eliminado.');
    setDeletingTest(null);
    load();
  }

  if (isLoading || !unit) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/subjects/${subjectId}`}
        className="flex w-fit items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Volver a la asignatura
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Unidad {unit.unit_order} — {unit.name}
        </h1>
        {unit.description && <p className="mt-1 text-sm text-slate-500">{unit.description}</p>}
      </div>

      <Tabs
        active={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'material', label: 'Material' },
          { id: 'summaries', label: 'Resúmenes' },
          { id: 'tests', label: 'Tests' },
        ]}
      />

      {activeTab === 'material' && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <Button onClick={openCreateMaterial} className="gap-1.5">
              <Plus className="h-4 w-4" /> Agregar material
            </Button>
          </div>

          {materials.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Esta unidad todavía no tiene material."
              description="Sube apuntes, documentos, PDFs o enlaces de estudio."
              action={
                <button onClick={openCreateMaterial} className="text-sm font-medium text-brand-600 hover:underline">
                  + Agregar el primer material
                </button>
              }
            />
          ) : (
            <div className="flex flex-col gap-2">
              {materials.map((material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  onEdit={() => {
                    setEditingMaterial(material);
                    setMaterialModalOpen(true);
                  }}
                  onDelete={() => setDeletingMaterial(material)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'summaries' && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <Button onClick={openCreateSummary} className="gap-1.5">
              <Plus className="h-4 w-4" /> Nuevo resumen
            </Button>
          </div>

          {summaries.length === 0 ? (
            <EmptyState
              icon={NotebookPen}
              title="Esta unidad todavía no tiene resúmenes."
              description="Escribe resúmenes de estudio para repasar los contenidos clave."
              action={
                <button onClick={openCreateSummary} className="text-sm font-medium text-brand-600 hover:underline">
                  + Crear el primer resumen
                </button>
              }
            />
          ) : (
            <div className="flex flex-col gap-3">
              {summaries.map((summary) => (
                <SummaryCard
                  key={summary.id}
                  summary={summary}
                  onEdit={() => {
                    setEditingSummary(summary);
                    setSummaryModalOpen(true);
                  }}
                  onDelete={() => setDeletingSummary(summary)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'tests' && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <Button onClick={openCreateTest} className="gap-1.5">
              <Plus className="h-4 w-4" /> Nuevo test
            </Button>
          </div>

          {tests.length === 0 ? (
            <EmptyState
              icon={ClipboardCheck}
              title="Esta unidad todavía no tiene tests."
              description="Crea un test y agrégale preguntas de alternativas para autoevaluarte."
              action={
                <button onClick={openCreateTest} className="text-sm font-medium text-brand-600 hover:underline">
                  + Crear el primer test
                </button>
              }
            />
          ) : (
            <div className="flex flex-col gap-2">
              {tests.map((test) => (
                <TestListItem
                  key={test.id}
                  test={test}
                  questionCount={questionCounts[test.id] ?? 0}
                  basePath={basePath}
                  onEdit={() => {
                    setEditingTest(test);
                    setTestModalOpen(true);
                  }}
                  onDelete={() => setDeletingTest(test)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modales y confirmaciones */}

      <MaterialFormModal
        open={materialModalOpen}
        initial={editingMaterial}
        isSaving={isSavingMaterial}
        onClose={() => setMaterialModalOpen(false)}
        onSubmit={handleSubmitMaterial}
      />
      <ConfirmDialog
        open={!!deletingMaterial}
        title="Eliminar material"
        description={`Se eliminará "${deletingMaterial?.title}" de forma permanente.`}
        isLoading={isDeletingMaterial}
        onConfirm={handleDeleteMaterial}
        onCancel={() => setDeletingMaterial(null)}
      />

      <SummaryFormModal
        open={summaryModalOpen}
        initial={editingSummary}
        isSaving={isSavingSummary}
        onClose={() => setSummaryModalOpen(false)}
        onSubmit={handleSubmitSummary}
      />
      <ConfirmDialog
        open={!!deletingSummary}
        title="Eliminar resumen"
        description={`Se eliminará "${deletingSummary?.title}" de forma permanente.`}
        isLoading={isDeletingSummary}
        onConfirm={handleDeleteSummary}
        onCancel={() => setDeletingSummary(null)}
      />

      <TestFormModal
        open={testModalOpen}
        initial={editingTest}
        isSaving={isSavingTest}
        onClose={() => setTestModalOpen(false)}
        onSubmit={handleSubmitTest}
      />
      <ConfirmDialog
        open={!!deletingTest}
        title="Eliminar test"
        description={`Se eliminará "${deletingTest?.title}" junto con todas sus preguntas y resultados asociados. Esta acción no se puede deshacer.`}
        isLoading={isDeletingTest}
        onConfirm={handleDeleteTest}
        onCancel={() => setDeletingTest(null)}
      />
    </div>
  );
}
