'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, BookOpen, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { SubjectFormModal, type SubjectFormValues } from '@/components/subject/SubjectFormModal';
import { SubjectCard } from '@/components/subject/SubjectCard';
import type { Subject } from '@/types/database';

export default function SubjectsPage() {
  const { showToast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadSubjects = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      showToast('error', 'No se pudieron cargar tus asignaturas.');
    } else {
      setSubjects(data ?? []);
    }
    setIsLoading(false);
  }, [showToast]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  function openCreateModal() {
    setEditingSubject(null);
    setModalOpen(true);
  }

  function openEditModal(subject: Subject) {
    setEditingSubject(subject);
    setModalOpen(true);
  }

  async function handleSubmit(values: SubjectFormValues) {
    setIsSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (editingSubject) {
      const { error } = await supabase
        .from('subjects')
        .update({
          name: values.name,
          code: values.code || null,
          description: values.description || null,
          color: values.color,
        })
        .eq('id', editingSubject.id);

      setIsSaving(false);
      if (error) {
        showToast('error', 'No se pudo guardar la información.');
        return;
      }
      showToast('success', 'Asignatura actualizada correctamente.');
    } else {
      const { error } = await supabase.from('subjects').insert({
        user_id: user.id,
        name: values.name,
        code: values.code || null,
        description: values.description || null,
        color: values.color,
      });

      setIsSaving(false);
      if (error) {
        showToast('error', 'No se pudo guardar la información.');
        return;
      }
      showToast('success', 'Asignatura creada correctamente.');
    }

    setModalOpen(false);
    loadSubjects();
  }

  async function handleDelete() {
    if (!deletingSubject) return;
    setIsDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from('subjects').delete().eq('id', deletingSubject.id);
    setIsDeleting(false);

    if (error) {
      showToast('error', 'No se pudo eliminar la asignatura.');
      return;
    }
    showToast('success', 'Asignatura eliminada.');
    setDeletingSubject(null);
    loadSubjects();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Mis asignaturas</h1>
          <p className="text-sm text-slate-500">Organiza tu material académico por asignatura.</p>
        </div>
        <Button onClick={openCreateModal} className="gap-1.5">
          <Plus className="h-4 w-4" /> Nueva asignatura
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No tienes asignaturas todavía."
          description="Crea tu primera asignatura para empezar a organizar tu material académico."
          action={
            <button onClick={openCreateModal} className="text-sm font-medium text-brand-600 hover:underline">
              + Crear mi primera asignatura
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onEdit={() => openEditModal(subject)}
              onDelete={() => setDeletingSubject(subject)}
            />
          ))}
        </div>
      )}

      <SubjectFormModal
        open={modalOpen}
        initial={editingSubject}
        isSaving={isSaving}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deletingSubject}
        title="Eliminar asignatura"
        description={`Se eliminará "${deletingSubject?.name}" junto con todas sus unidades, material, resúmenes y tests. Esta acción no se puede deshacer.`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingSubject(null)}
      />
    </div>
  );
}
