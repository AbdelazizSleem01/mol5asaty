'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import { translations } from '@/lib/i18n';
import { QuizForm } from '@/components/quiz/QuizForm';
import { Question } from '@/types';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function CreateQuizPage() {
  const [isCreating, setIsCreating] = useState(false);
  const { language } = useUIStore();
  const router = useRouter();
  const t = translations[language];

  const handleCreateQuiz = async (quizData: { title: string; displayName?: string; thumbnail?: string; timeLimit?: number; questions: Question[] }) => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/quiz/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(quizData),
      });

      const data = await response.json();

      if (data.success) {
        // Use slug if available, otherwise fallback to ID
        const quizIdentifier = data.quiz.slug || data.quiz.id;
        router.push(`/quiz/${quizIdentifier}/submissions`);
      } else {
        alert(data.error || t.quiz.failedToCreateQuiz || 'Failed to create quiz');
      }
    } catch (error) {
      console.error('Failed to create quiz:', error);
      alert(t.quiz.failedToCreateQuiz || 'Failed to create quiz');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            {t.quiz.createQuiz}
          </h1>
          <p className="text-lg text-foreground/80 mt-2">
            {t.quiz.createQuizDesc || 'Create a new quiz with multiple choice questions'}
          </p>
        </div>

        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground/90 rounded-xl hover:bg-muted transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
          {t.common.cancel}
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-card rounded-3xl shadow-xl border border-border/50 p-8">
        {isCreating ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              <p className="text-xl font-medium text-foreground/80">
                {t.quiz.creatingQuiz || 'Creating your quiz...'}
              </p>
            </div>
          </div>
        ) : (
          <QuizForm onSubmit={handleCreateQuiz} />
        )}
      </div>

      {/* Tips Card */}
      <div className="bg-linear-to-br from-primary/5 to-muted/20 rounded-3xl border border-primary/20 p-8">
        <h3 className="text-xl font-semibold mb-6 text-primary">
          {t.quiz.tipsTitle || 'Tips for creating effective quizzes'}
        </h3>
        <ul className="space-y-4 text-foreground/80">
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold text-xl mt-0.5">•</span>
            <span>{t.quiz.tip1 || 'Use clear and concise question wording'}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold text-xl mt-0.5">•</span>
            <span>{t.quiz.tip2 || 'Ensure only one correct answer per question'}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold text-xl mt-0.5">•</span>
            <span>{t.quiz.tip3 || 'Make incorrect answers plausible'}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold text-xl mt-0.5">•</span>
            <span>{t.quiz.tip4 || 'Consider adding explanations for correct answers'}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold text-xl mt-0.5">•</span>
            <span>{t.quiz.tip5 || 'Test your quiz before sharing with students'}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
