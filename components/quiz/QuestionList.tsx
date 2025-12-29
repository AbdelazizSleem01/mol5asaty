// components/quiz/QuestionList.tsx
'use client';

import { Question } from '@/types';
import { useUIStore } from '@/store/uiStore';
import { translations } from '@/lib/i18n';
import { Trash2, Edit2 } from 'lucide-react';

interface QuestionListProps {
  questions: Question[];
  onEditQuestion: (index: number) => void;
  onDeleteQuestion: (index: number) => void;
  readOnly?: boolean;
}

export function QuestionList({ questions, onEditQuestion, onDeleteQuestion, readOnly = false }: QuestionListProps) {
  const { language } = useUIStore();
  const t = translations[language];

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          No questions added yet. Add your first question to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <div
          key={question.id}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center shrink-0">
                {index + 1}
              </div>
              <div>
                <h4 className="font-medium dark:text-white">{question.questionText}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {question.choices.length} {t.quiz.choices.toLowerCase()}
                </p>
              </div>
            </div>

            {!readOnly && (
              <div className="flex gap-2">
                <button
                  onClick={() => onEditQuestion(index)}
                  className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  title={t.common.edit}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteQuestion(index)}
                  className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  title={t.common.delete}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2 ml-11">
            {question.choices.map((choice, choiceIndex) => (
              <div
                key={choiceIndex}
                className={`p-3 rounded-lg ${choiceIndex === question.correctAnswer
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-gray-50 dark:bg-gray-700'
                  }`}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border mx-3 flex items-center justify-center ${choiceIndex === question.correctAnswer
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-400 text-gray-700 dark:text-gray-300'
                    }`}>
                    {String.fromCharCode(65 + choiceIndex)}
                  </div>
                  <span className={choiceIndex === question.correctAnswer ? 'text-green-700 dark:text-green-300' : 'dark:text-gray-300'}>
                    {choice}
                  </span>
                  {choiceIndex === question.correctAnswer && (
                    <span className="ml-auto text-xs font-medium text-green-700 dark:text-green-300">
                      ✓ {t.quiz.correctAnswer}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}