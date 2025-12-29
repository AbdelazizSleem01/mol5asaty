'use client';

import { useState, useEffect } from 'react';
import { Question } from '@/types';
import { useUIStore } from '@/store/uiStore';
import { translations } from '@/lib/i18n';
import { X } from 'lucide-react';

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (question: Omit<Question, 'id'>) => void;
  editingQuestion?: Question | null;
}

export function AddQuestionModal({ isOpen, onClose, onAdd, editingQuestion }: AddQuestionModalProps) {
  const [questionText, setQuestionText] = useState('');
  const [choices, setChoices] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);

  const { language } = useUIStore();
  const t = translations[language];

  // Update form when editing question changes
  useEffect(() => {
    if (editingQuestion) {
      setQuestionText(editingQuestion.questionText);
      setChoices([...editingQuestion.choices]);
      setCorrectAnswer(editingQuestion.correctAnswer);
    } else {
      setQuestionText('');
      setChoices(['', '', '', '']);
      setCorrectAnswer(0);
    }
  }, [editingQuestion]);

  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    setChoices(newChoices);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionText.trim() || choices.some((c) => !c.trim())) {
      return;
    }

    onAdd({
      questionText,
      choices,
      correctAnswer,
    });

    // Reset form
    setQuestionText('');
    setChoices(['', '', '', '']);
    setCorrectAnswer(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-2xl border border-border/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold bg-linear-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            {editingQuestion ? t.quiz.editQuestion : t.quiz.addQuestion}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted/50 transition-colors"
          >
            <X className="w-6 h-6 text-foreground/70 hover:text-foreground" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-8">
          {/* Question Text */}
          <div className="space-y-2">
            <label htmlFor="questionText" className="block text-sm font-semibold text-foreground/90">
              {t.quiz.question}
            </label>
            <textarea
              id="questionText"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full px-5 py-4 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-foreground transition-all resize-none"
              rows={4}
              placeholder={t.quiz.enterQuestion || 'Enter your question here...'}
              required
            />
          </div>

          {/* Choices */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-foreground/90">
              {t.quiz.choices}
            </label>
            <div className="space-y-3">
              {choices.map((choice, index) => (
                <div key={index} className="flex items-center gap-4">
                  <input
                    type="radio"
                    name="correctAnswer"
                    id={`choice-${index}`}
                    checked={correctAnswer === index}
                    onChange={() => setCorrectAnswer(index)}
                    className="w-5 h-5 text-primary focus:ring-primary border-border cursor-pointer"
                  />
                  <label
                    htmlFor={`choice-${index}`}
                    className="flex-1 cursor-pointer"
                  >
                    <input
                      type="text"
                      value={choice}
                      onChange={(e) => handleChoiceChange(index, e.target.value)}
                      className="w-full px-5 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-foreground transition-all"
                      placeholder={`${t.quiz.choice} ${index + 1}`}
                      required
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-border text-foreground/90 rounded-xl hover:bg-muted transition-all duration-300"
            >
              {t.common.cancel}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={choices.some((c) => !c.trim()) || !questionText.trim()}
              className="px-8 py-3 bg-linear-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:from-primary-hover hover:to-primary-dark transition-all shadow-md hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingQuestion ? t.common.save : t.common.add}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
