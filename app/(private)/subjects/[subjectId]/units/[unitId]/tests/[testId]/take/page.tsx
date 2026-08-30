'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, RotateCcw, PartyPopper, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { TakeTestQuestion } from '@/components/test/TakeTestQuestion';
import type { Test, Question, QuestionOption } from '@/types/database';

type QuestionWithOptions = Question & { options: QuestionOption[] };

export default function TakeTestPage() {
  const { subjectId, unitId, testId } = useParams<{ subjectId: string; unitId: string; testId: string }>();
  const router = useRouter();
  const { showToast } = useToast();

  const unitBasePath = `/subjects/${subjectId}/units/${unitId}`;
  const testBasePath = `${unitBasePath}/tests/${testId}`;

  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> optionId
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [result, setResult] = useState<{ score: number; total: number; percentage: number } | null>(null);

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

    const loaded = (questionsData as QuestionWithOptions[]) ?? [];
    if (loaded.length === 0) {
      showToast('error', 'Este test todavía no tiene preguntas.');
      router.push(testBasePath);
      return;
    }

    setQuestions(loaded);
    setIsLoading(false);
  }, [testId, unitBasePath, testBasePath, router, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  function selectAnswer(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    setValidationError('');
  }

  function resetAttempt() {
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    setValidationError('');
  }

  async function handleSubmit() {
    const unanswered = questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      setValidationError(
        `Debes responder todas las preguntas antes de enviar. Te falta${unanswered.length === 1 ? '' : 'n'} ${unanswered.length}.`
      );
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    let correctCount = 0;
    questions.forEach((q) => {
      const selectedOption = q.options.find((o) => o.id === answers[q.id]);
      if (selectedOption?.is_correct) correctCount += 1;
    });

    const total = questions.length;
    const percentage = Math.round((correctCount / total) * 10000) / 100;

    const { error } = await supabase.from('test_attempts').insert({
      test_id: testId,
      user_id: user.id,
      score: correctCount,
      total_questions: total,
      percentage,
    });

    setIsSubmitting(false);
    if (error) {
      showToast('error', 'No se pudo guardar tu resultado. Inténtalo nuevamente.');
      return;
    }

    setResult({ score: correctCount, total, percentage });
    setSubmitted(true);
  }

  if (isLoading || !test) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="flex flex-col gap-6 pb-10">
      <Link href={testBasePath} className="flex w-fit items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-3.5 w-3.5" /> Volver al test
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-slate-900">{test.title}</h1>
        {test.description && <p className="mt-1 text-sm text-slate-500">{test.description}</p>}
      </div>

      {submitted && result ? (
        <div className="flex flex-col gap-6">
          <div
            className={`flex flex-col items-center gap-2 rounded-2xl border p-8 text-center shadow-sm ${
              result.percentage >= 60
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-amber-200 bg-amber-50'
            }`}
          >
            {result.percentage >= 60 ? (
              <PartyPopper className="h-8 w-8 text-emerald-600" />
            ) : (
              <AlertCircle className="h-8 w-8 text-amber-600" />
            )}
            <p className="text-3xl font-bold text-slate-900">{result.percentage}%</p>
            <p className="text-sm text-slate-600">
              Respondiste correctamente {result.score} de {result.total} preguntas.
            </p>
          </div>

          <div>
            <h2 className="mb-3 font-semibold text-slate-900">Revisión</h2>
            <div className="flex flex-col gap-3">
              {questions.map((question, index) => (
                <TakeTestQuestion
                  key={question.id}
                  index={index}
                  question={question}
                  selectedOptionId={answers[question.id] ?? null}
                  onSelect={() => {}}
                  showResult
                />
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={resetAttempt} className="gap-1.5">
              <RotateCcw className="h-4 w-4" /> Intentar de nuevo
            </Button>
            <Link href={testBasePath}>
              <Button>Volver al test</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="sticky top-0 z-10 -mx-4 bg-slate-50/95 px-4 py-2 backdrop-blur sm:mx-0 sm:px-0">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                {answeredCount} de {questions.length} respondidas
              </span>
              <span>{Math.round((answeredCount / questions.length) * 100)}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-brand-600 transition-all"
                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {validationError && (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">⚠ {validationError}</p>
          )}

          <div className="flex flex-col gap-3">
            {questions.map((question, index) => (
              <TakeTestQuestion
                key={question.id}
                index={index}
                question={question}
                selectedOptionId={answers[question.id] ?? null}
                onSelect={(optionId) => selectAnswer(question.id, optionId)}
              />
            ))}
          </div>

          <div className="flex justify-center">
            <Button onClick={handleSubmit} isLoading={isSubmitting} className="px-8">
              Enviar respuestas
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
