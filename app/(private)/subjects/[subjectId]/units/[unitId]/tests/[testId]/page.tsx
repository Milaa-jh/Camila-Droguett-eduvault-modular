'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, HelpCircle, Loader2, Pencil, PlayCircle, History } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { TestFormModal, type TestFormValues } from '@/components/test/TestFormModal';
import { QuestionFormModal, type QuestionFormValues } from '@/components/test/QuestionFormModal';
import { QuestionCard } from '@/components/test/QuestionCard';
import type { Test, Question, QuestionOption, TestAttempt } from '@/types/database';

type QuestionWithOptions = Question & { options: QuestionOption[] };

export default function TestDetailPage() {
  const { subjectId, unitId, testId } = useParams<{ subjectId: string; unitId: string; testId: string }>();
  const router = useRouter();
  const { showToast } = useToast();

  const unitBasePath = `/subjects/${subjectId}/units/${unitId}`;

  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [testModalOpen, setTestModalOpen] = useState(false);
  const [isSavingTest, setIsSavingTest] = useState(false);

  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionWithOptions | null>(null);
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);
  const [deletingQuestion, setDeletingQuestion] = useState<QuestionWithOptions | null>(null);
  const [isDeletingQuestion, setIsDeletingQuestion] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();

    const { data: testData, error: testError } = await supabase
      .from('tests')
      .select('*')
      .eq('id', testId)
      .single();

    if (testError || !testData) {
      showToast('error', 'No se encontró el test.');
      router.push(unitBasePath);
      return;
    }
    setTest(testData);

    const { data: questionsData } = await supabase
      .from('questions')
      .select('*, options(*)')
      .eq('test_id', testId)
      .order('created_at', { ascending: true });

    setQuestions((questionsData as QuestionWithOptions[]) ?? []);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: attemptsData } = await supabase
        .from('test_attempts')
        .select('*')
        .eq('test_id', testId)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(5);
      setAttempts(attemptsData ?? []);
    }

    setIsLoading(false);
  }, [testId, unitBasePath, router, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleEditTest(values: TestFormValues) {
    if (!test) return;
    setIsSavingTest(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('tests')
      .update({ title: values.title, description: values.description || null })
      .eq('id', test.id);

    setIsSavingTest(false);
    if (error) {
      showToast('error', 'No se pudo guardar la información.');
      return;
    }
    showToast('success', 'Test actualizado correctamente.');
    setTestModalOpen(false);
    load();
  }

  function openCreateQuestion() {
    setEditingQuestion(null);
    setQuestionModalOpen(true);
  }

  function openEditQuestion(question: QuestionWithOptions) {
    setEditingQuestion(question);
    setQuestionModalOpen(true);
  }

  async function handleSubmitQuestion(values: QuestionFormValues) {
    setIsSavingQuestion(true);
    const supabase = createClient();

    if (editingQuestion) {
      const { error: qError } = await supabase
        .from('questions')
        .update({ question_text: values.questionText })
        .eq('id', editingQuestion.id);

      if (qError) {
        setIsSavingQuestion(false);
        showToast('error', 'No se pudo guardar la pregunta.');
        return;
      }

      // Estrategia simple y segura: reemplazar todas las alternativas de la pregunta.
      await supabase.from('options').delete().eq('question_id', editingQuestion.id);
      const { error: optError } = await supabase.from('options').insert(
        values.options.map((o) => ({
          question_id: editingQuestion.id,
          option_text: o.text,
          is_correct: o.isCorrect,
        }))
      );

      setIsSavingQuestion(false);
      if (optError) {
        showToast('error', 'No se pudieron guardar las alternativas.');
        return;
      }
      showToast('success', 'Pregunta actualizada correctamente.');
    } else {
      const { data: newQuestion, error: qError } = await supabase
        .from('questions')
        .insert({ test_id: testId, question_text: values.questionText })
        .select()
        .single();

      if (qError || !newQuestion) {
        setIsSavingQuestion(false);
        showToast('error', 'No se pudo guardar la pregunta.');
        return;
      }

      const { error: optError } = await supabase.from('options').insert(
        values.options.map((o) => ({
          question_id: newQuestion.id,
          option_text: o.text,
          is_correct: o.isCorrect,
        }))
      );

      setIsSavingQuestion(false);
      if (optError) {
        showToast('error', 'No se pudieron guardar las alternativas.');
        return;
      }
      showToast('success', 'Pregunta agregada correctamente.');
    }

    setQuestionModalOpen(false);
    load();
  }

  async function handleDeleteQuestion() {
    if (!deletingQuestion) return;
    setIsDeletingQuestion(true);
    const supabase = createClient();
    const { error } = await supabase.from('questions').delete().eq('id', deletingQuestion.id);
    setIsDeletingQuestion(false);

    if (error) {
      showToast('error', 'No se pudo eliminar la pregunta.');
      return;
    }
    showToast('success', 'Pregunta eliminada.');
    setDeletingQuestion(null);
    load();
  }

  if (isLoading || !test) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href={unitBasePath} className="flex w-fit items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-3.5 w-3.5" /> Volver a la unidad
      </Link>

      <div className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{test.title}</h1>
          {test.description && <p className="mt-1 text-sm text-slate-500">{test.description}</p>}
          <p className="mt-2 text-xs text-slate-400">
            {questions.length} {questions.length === 1 ? 'pregunta' : 'preguntas'}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" onClick={() => setTestModalOpen(true)} className="gap-1.5">
            <Pencil className="h-3.5 w-3.5" /> Editar
          </Button>
          {questions.length > 0 && (
            <Link href={`${unitBasePath}/tests/${testId}/take`}>
              <Button className="gap-1.5">
                <PlayCircle className="h-4 w-4" /> Realizar test
              </Button>
            </Link>
          )}
        </div>
      </div>

      {attempts.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <History className="h-4 w-4 text-slate-400" />
            <h2 className="font-semibold text-slate-900">Tus últimos intentos</h2>
          </div>
          <div className="flex flex-col gap-2">
            {attempts.map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
              >
                <span className="text-slate-500">
                  {new Date(attempt.completed_at).toLocaleDateString('es-CL', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="font-medium text-slate-800">
                  {attempt.score}/{attempt.total_questions} · {attempt.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Preguntas</h2>
          <Button onClick={openCreateQuestion} className="gap-1.5">
            <Plus className="h-4 w-4" /> Nueva pregunta
          </Button>
        </div>

        {questions.length === 0 ? (
          <EmptyState
            icon={HelpCircle}
            title="Este test todavía no tiene preguntas."
            description="Agrega preguntas de alternativas para poder rendir este test."
            action={
              <button onClick={openCreateQuestion} className="text-sm font-medium text-brand-600 hover:underline">
                + Agregar la primera pregunta
              </button>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                index={index}
                question={question}
                onEdit={() => openEditQuestion(question)}
                onDelete={() => setDeletingQuestion(question)}
              />
            ))}
          </div>
        )}
      </div>

      <TestFormModal
        open={testModalOpen}
        initial={test}
        isSaving={isSavingTest}
        onClose={() => setTestModalOpen(false)}
        onSubmit={handleEditTest}
      />

      <QuestionFormModal
        open={questionModalOpen}
        initial={editingQuestion}
        isSaving={isSavingQuestion}
        onClose={() => setQuestionModalOpen(false)}
        onSubmit={handleSubmitQuestion}
      />

      <ConfirmDialog
        open={!!deletingQuestion}
        title="Eliminar pregunta"
        description="Se eliminará esta pregunta junto con sus alternativas. Esta acción no se puede deshacer."
        isLoading={isDeletingQuestion}
        onConfirm={handleDeleteQuestion}
        onCancel={() => setDeletingQuestion(null)}
      />
    </div>
  );
}
