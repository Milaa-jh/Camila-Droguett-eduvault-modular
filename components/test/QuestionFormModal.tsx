'use client';

import { useState, FormEvent, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';
import { isNonEmpty } from '@/lib/utils/validation';
import type { Question, QuestionOption } from '@/types/database';

export interface QuestionFormValues {
  questionText: string;
  options: { id?: string; text: string; isCorrect: boolean }[];
}

interface QuestionFormModalProps {
  open: boolean;
  initial?: (Question & { options: QuestionOption[] }) | null;
  isSaving?: boolean;
  onClose: () => void;
  onSubmit: (values: QuestionFormValues) => void;
}

const EMPTY_OPTIONS = [
  { text: '', isCorrect: true },
  { text: '', isCorrect: false },
  { text: '', isCorrect: false },
  { text: '', isCorrect: false },
];

export function QuestionFormModal({ open, initial, isSaving, onClose, onSubmit }: QuestionFormModalProps) {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<{ id?: string; text: string; isCorrect: boolean }[]>(EMPTY_OPTIONS);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setQuestionText(initial?.question_text ?? '');
      setOptions(
        initial
          ? initial.options.map((o) => ({ id: o.id, text: o.option_text, isCorrect: o.is_correct }))
          : EMPTY_OPTIONS
      );
      setError('');
    }
  }, [open, initial]);

  if (!open) return null;

  function updateOptionText(index: number, text: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, text } : o)));
  }

  function setCorrectOption(index: number) {
    setOptions((prev) => prev.map((o, i) => ({ ...o, isCorrect: i === index })));
  }

  function addOption() {
    if (options.length >= 6) return;
    setOptions((prev) => [...prev, { text: '', isCorrect: false }]);
  }

  function removeOption(index: number) {
    if (options.length <= 2) return;
    setOptions((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (!next.some((o) => o.isCorrect)) next[0].isCorrect = true;
      return next;
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!isNonEmpty(questionText)) {
      setError('Debes ingresar el enunciado de la pregunta.');
      return;
    }
    if (options.some((o) => !isNonEmpty(o.text))) {
      setError('Todas las alternativas deben tener texto.');
      return;
    }
    if (!options.some((o) => o.isCorrect)) {
      setError('Debes marcar una alternativa como correcta.');
      return;
    }

    onSubmit({ questionText: questionText.trim(), options: options.map((o) => ({ ...o, text: o.text.trim() })) });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">{initial ? 'Editar pregunta' : 'Nueva pregunta'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">⚠ {error}</p>}

          <TextArea
            label="Enunciado"
            placeholder="¿Cuál es el objetivo del análisis exploratorio?"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            autoFocus
          />

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">Alternativas</p>
              <p className="text-xs text-slate-400">Marca la correcta</p>
            </div>

            <div className="flex flex-col gap-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCorrectOption(index)}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 text-xs font-semibold transition-colors ${
                      option.isCorrect
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 text-slate-400 hover:border-slate-300'
                    }`}
                    aria-label={option.isCorrect ? 'Alternativa correcta' : 'Marcar como correcta'}
                  >
                    {String.fromCharCode(65 + index)}
                  </button>
                  <Input
                    value={option.text}
                    onChange={(e) => updateOptionText(index, e.target.value)}
                    placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    disabled={options.length <= 2}
                    className="shrink-0 rounded-lg p-2 text-slate-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-300"
                    aria-label="Eliminar alternativa"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {options.length < 6 && (
              <button
                type="button"
                onClick={addOption}
                className="mt-2 flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Agregar alternativa
              </button>
            )}
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {initial ? 'Guardar cambios' : 'Agregar pregunta'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
