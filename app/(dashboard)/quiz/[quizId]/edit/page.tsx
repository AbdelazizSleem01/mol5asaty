'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { translations } from '@/lib/i18n';
import { QuizForm } from '@/components/quiz/QuizForm';
import { Question } from '@/types';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function EditQuizPage() {
  const params = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const { language } = useUIStore();
  const t = translations[language];

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quiz/${params.quizId}`, {
          credentials: 'include',
        });

        const data = await response.json();
        if (data.success) {
          setQuiz(data.quiz);
        } else {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Failed to fetch quiz:', error);
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [params.quizId, router]);

  const handleUpdateQuiz = async (quizData: { title: string; displayName?: string; thumbnail?: string; timeLimit?: number; questions: Question[] }) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/quiz/${params.quizId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(quizData),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/dashboard');
      } else {
        alert(data.error || 'Failed to update quiz');
      }
    } catch (error) {
      console.error('Failed to update quiz:', error);
      alert('Failed to update quiz');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!quiz) return null;

  const initialData = {
    title: quiz.title,
    displayName: quiz.displayName,
    thumbnail: quiz.thumbnail,
    timeLimit: quiz.timeLimit,
    questions: quiz.questions,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            {t.quiz.editQuiz}
          </h1>
          <p className="text-lg text-foreground/80 mt-2">
            {t.quiz.createQuizDesc || 'Edit your quiz with multiple choice questions'}
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
        {isUpdating ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              <p className="text-xl font-medium text-foreground/80">
                {t.quiz.creatingQuiz || 'Updating your quiz...'}
              </p>
            </div>
          </div>
        ) : (
          <QuizForm onSubmit={handleUpdateQuiz} initialData={initialData} />
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
