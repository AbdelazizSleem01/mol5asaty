// components/quiz/AnswerSheet.tsx
'use client';

import { useState } from 'react';
import { Question } from '@/types';
import { useUIStore } from '@/store/uiStore';
import { translations } from '@/lib/i18n';

interface AnswerSheetProps {
  questions: Question[];
  studentAnswers: number[];
  onAnswerChange: (questionIndex: number, answer: number) => void;
  currentQuestion: number;
  onQuestionSelect: (index: number) => void;
}

export function AnswerSheet({
  questions,
  studentAnswers,
  currentQuestion,
  onQuestionSelect,
}: AnswerSheetProps) {
  const [showSheet, setShowSheet] = useState(false);
  const { language } = useUIStore();
  const t = translations[language];
  
  const getAnswerStatus = (index: number) => {
    if (studentAnswers[index] === -1) return 'unanswered';
    if (studentAnswers[index] === questions[index].correctAnswer) return 'correct';
    return 'answered';
  };
  
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-auto z-10">
      {/* Toggle Button */}
      <button
        onClick={() => setShowSheet(!showSheet)}
        className="w-full md:w-auto bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2"
      >
        <span>{showSheet ? t.quiz.hideAnswers : t.quiz.showAnswers}</span>
        <span className="md:hidden">({questions.length})</span>
      </button>
      
      {/* Answer Sheet */}
      {showSheet && (
        <div className="mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold dark:text-white">{t.quiz.questions}</h4>
            <button
              onClick={() => setShowSheet(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {questions.map((_, index) => {
              const status = getAnswerStatus(index);
              const isCurrent = index === currentQuestion;
              
              let bgClass = '';
              let textClass = '';
              
              if (isCurrent) {
                bgClass = 'bg-blue-600';
                textClass = 'text-white';
              } else if (status === 'correct') {
                bgClass = 'bg-green-500';
                textClass = 'text-white';
              } else if (status === 'answered') {
                bgClass = 'bg-yellow-500';
                textClass = 'text-white';
              } else {
                bgClass = 'bg-gray-100 dark:bg-gray-700';
                textClass = 'text-gray-700 dark:text-gray-300';
              }
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    onQuestionSelect(index);
                    setShowSheet(false);
                  }}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgClass} ${textClass} transition-colors`}
                  title={`Question ${index + 1} - ${status}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-600"></div>
              <span className="text-sm dark:text-gray-300">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span className="text-sm dark:text-gray-300">Correct</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500"></div>
              <span className="text-sm dark:text-gray-300">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-700"></div>
              <span className="text-sm dark:text-gray-300">Unanswered</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}