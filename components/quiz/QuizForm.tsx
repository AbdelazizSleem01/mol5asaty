'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Question } from '@/types';
import { useUIStore } from '@/store/uiStore';
import { translations } from '@/lib/i18n';
import { AddQuestionModal } from './AddQuestionModal';
import { Loader2, Plus, Trash2, Edit3 } from 'lucide-react';

interface QuizFormProps {
  onSubmit: (quizData: { title: string; displayName?: string; thumbnail?: string; timeLimit?: number; questions: Question[] }) => Promise<void>;
  initialData?: { title: string; displayName?: string; thumbnail?: string; timeLimit?: number; questions: Question[] };
}

export function QuizForm({ onSubmit, initialData }: QuizFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [displayName, setDisplayName] = useState(initialData?.displayName || '');
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || '');
  const [timeLimit, setTimeLimit] = useState<number | undefined>(initialData?.timeLimit);
  const [questions, setQuestions] = useState<Question[]>(initialData?.questions || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageError, setImageError] = useState(false);

  const { language } = useUIStore();
  const t = translations[language];

  // Reset image error when thumbnail URL changes
  useEffect(() => {
    setImageError(false);
  }, [thumbnail]);

  const addQuestion = (question: Omit<Question, 'id'>) => {
    const newQuestion = {
      ...question,
      id: `question-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const editQuestion = (id: string) => {
    const questionToEdit = questions.find((q) => q.id === id);
    if (questionToEdit) {
      setEditingQuestion(questionToEdit);
      setIsModalOpen(true);
    }
  };

  const updateQuestion = (updatedQuestion: Omit<Question, 'id'>) => {
    if (editingQuestion) {
      setQuestions(questions.map((q) =>
        q.id === editingQuestion.id
          ? { ...updatedQuestion, id: editingQuestion.id }
          : q
      ));
      setEditingQuestion(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || questions.length === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        displayName: displayName || undefined,
        thumbnail: thumbnail || undefined,
        timeLimit,
        questions
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Quiz Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-semibold text-foreground/90">
          {t.quiz.quizTitle}
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-5 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-foreground transition-all"
          placeholder={t.quiz.quizTitle}
          required
        />
      </div>

      {/* Display Name */}
      <div className="space-y-2">
        <label htmlFor="displayName" className="block text-sm font-semibold text-foreground/90">
          {t.quiz.displayName}
        </label>
        <input
          type="text"
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full px-5 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-foreground transition-all"
          placeholder={t.quiz.displayName}
        />
      </div>

      {/* Thumbnail */}
      <div className="space-y-2">
        <label htmlFor="thumbnail" className="block text-sm font-semibold text-foreground/90">
          {t.quiz.thumbnail}
        </label>
        <input
          type="url"
          id="thumbnail"
          value={thumbnail}
          onChange={(e) => setThumbnail(e.target.value)}
          className="w-full px-5 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-foreground transition-all"
          placeholder={t.quiz.thumbnailPlaceholder}
        />
        {thumbnail && (
          <div className="mt-4 p-4 border border-border rounded-xl bg-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground/90">معاينة الصورة</span>
              <button
                type="button"
                onClick={() => setThumbnail('')}
                className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
              >
                إزالة الصورة
              </button>
            </div>
            <div className="flex justify-center">
              <div className="relative w-full max-w-md h-48 rounded-lg border border-border/50 overflow-hidden">
                {!imageError ? (
                  <Image
                    src={thumbnail}
                    alt="معاينة الصورة"
                    fill
                    unoptimized
                    className="object-contain"
                    onError={() => setImageError(true)}
                    onLoad={() => setImageError(false)}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-center">
                      <div className="text-red-500 mb-2">
                        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                      </div>
                      <p className="text-red-600 dark:text-red-400 text-sm font-medium">فشل في تحميل الصورة</p>
                      <p className="text-red-500 dark:text-red-300 text-xs mt-1">تأكد من صحة الرابط</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Time Limit */}
      <div className="space-y-2">
        <label htmlFor="timeLimit" className="block text-sm font-semibold text-foreground/90">
          {t.dashboard.timeLimit} ({t.quiz.minutes})
        </label>
        <input
          type="number"
          id="timeLimit"
          value={timeLimit || ''}
          onChange={(e) => {
            const value = e.target.value;
            setTimeLimit(value ? parseInt(value) : undefined);
          }}
          className="w-full px-5 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-foreground transition-all"
          placeholder={`e.g., 30`}
          min="1"
          max="300"
        />
        <p className="text-xs text-foreground/60">
          Leave empty for unlimited time
        </p>
      </div>

      {/* Questions Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-xl font-semibold text-foreground">
            {t.quiz.questions} ({questions.length})
          </h3>
          <button
            type="button"
            onClick={() => {
              setEditingQuestion(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-primary to-primary-dark text-white font-medium rounded-xl hover:from-primary-hover hover:to-primary-dark transition-all shadow-md hover:shadow-primary/30 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            {t.quiz.addQuestion}
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="bg-card/50 rounded-2xl border border-border/50 p-12 text-center">
            <div className="max-w-md mx-auto">
              <p className="text-lg font-medium text-foreground/80 mb-4">
                {t.quiz.noQuestionsYet || 'No questions added yet'}
              </p>
              <p className="text-foreground/70 mb-6">
                {t.quiz.addFirstQuestion || 'Click "Add Question" to start building your quiz'}
              </p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-primary to-primary-dark text-white rounded-xl hover:from-primary-hover hover:to-primary-dark transition-all shadow-lg hover:shadow-primary/30"
              >
                <Plus className="w-5 h-5" />
                {t.quiz.addFirstQuestionBtn || 'Add First Question'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q, index) => (
              <div
                key={q.id}
                className="bg-card rounded-2xl border border-border/50 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-semibold text-foreground">
                    {t.quiz.question} {index + 1}: {q.questionText}
                  </h4>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => editQuestion(q.id)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title={t.common.edit}
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeQuestion(q.id)}
                      className="p-2 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
                      title={t.common.delete}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {q.choices.map((choice, idx) => (
                    <div
                      key={`${q.id}-choice-${idx}`}
                      className={`flex items-center gap-3 p-3 rounded-xl ${idx === q.correctAnswer
                          ? 'bg-green-500/10 border border-green-500/30'
                          : 'bg-muted/50 border border-border'
                        }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${idx === q.correctAnswer
                            ? 'bg-green-500 text-white'
                            : 'bg-muted text-foreground/70'
                          }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="text-foreground/90">{choice}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !title.trim() || questions.length === 0}
        className="w-full px-6 py-4 bg-linear-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:from-primary-hover hover:to-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-primary/30 transform hover:scale-[1.02]"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{t.common.saving}</span>
          </div>
        ) : (
          t.common.save
        )}
      </button>

      <AddQuestionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingQuestion(null);
        }}
        onAdd={editingQuestion ? updateQuestion : addQuestion}
        editingQuestion={editingQuestion}
      />
    </form>
  );
}
