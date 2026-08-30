'use client';

import { cn } from '@/lib/utils/cn';
import type { Question, QuestionOption } from '@/types/database';

interface TakeTestQuestionProps {
  index: number;
  question: Question & { options: QuestionOption[] };
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
  showResult?: boolean;
}

export function TakeTestQuestion({
  index,
  question,
  selectedOptionId,
  onSelect,
  showResult,
}: TakeTestQuestionProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="font-medium text-slate-800">
        <span className="text-slate-400">{index + 1}.</span> {question.question_text}
      </p>

      <div className="mt-3 flex flex-col gap-2">
        {question.options.map((option, i) => {
          const isSelected = selectedOptionId === option.id;
          const isCorrect = option.is_correct;

          let stateClasses = 'border-slate-200 hover:border-brand-300 hover:bg-brand-50/40';
          if (showResult) {
            if (isCorrect) {
              stateClasses = 'border-emerald-400 bg-emerald-50 text-emerald-800';
            } else if (isSelected && !isCorrect) {
              stateClasses = 'border-red-300 bg-red-50 text-red-700';
            } else {
              stateClasses = 'border-slate-100 text-slate-500';
            }
          } else if (isSelected) {
            stateClasses = 'border-brand-500 bg-brand-50 text-brand-800';
          }

          return (
            <button
              key={option.id}
              type="button"
              disabled={showResult}
              onClick={() => onSelect(option.id)}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors',
                stateClasses
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                  isSelected || (showResult && isCorrect) ? 'border-current' : 'border-slate-300 text-slate-400'
                )}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{option.option_text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
