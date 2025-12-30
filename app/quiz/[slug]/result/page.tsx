'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuizStore } from '@/store/quizStore';
import { useUIStore } from '@/store/uiStore';
import { translations } from '@/lib/i18n';
import { Quiz, Question } from '@/types';
import { CheckCircle, XCircle, Award, Home, Share2, ArrowLeft, Loader2 } from 'lucide-react';

export default function QuizResultPage() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const params = useParams();
  const router = useRouter();
  const { submittedQuiz, resetQuiz } = useQuizStore();
  const { language } = useUIStore();
  const t = translations[language];

  useEffect(() => {
    const fetchQuiz = async () => {
    try {
        const response = await fetch(`/api/quiz/${params.slug}`);
        const data = await response.json();
        if (data.success) {
          setQuiz(data.quiz);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Failed to fetch quiz:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [params.slug, router]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const hasAuthToken = document.cookie.includes('auth_token=');

      if (!hasAuthToken) {
        setIsLoggedIn(false);
        return;
      }

      try {
        const response = await fetch('/api/user/profile', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(data.success && data.user);
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (!submittedQuiz) {
      router.push(`/quiz/${params.slug}`);
    }
  }, [submittedQuiz, params.slug, router]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 50) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return t.results.excellent || 'Excellent! 🎉';
    if (score >= 70) return t.results.good || 'Good job! 👍';
    if (score >= 50) return t.results.notBad || 'Not bad! 👌';
    return t.results.keepPracticing || 'Keep practicing! 📚';
  };

  const handleNewQuiz = () => {
    resetQuiz();
    router.push(`/quiz/${params.slug}`);
  };

  const shareResult = () => {
    const text = `${t.results.shareMessage || 'I scored'} ${submittedQuiz?.score}% ${t.results.on || 'on'} "${quiz?.title}" ${t.results.quizOn || 'quiz on'} Mokta'b|مكتئب !`;

    if (navigator.share) {
      navigator.share({
        title: t.results.myResult || 'My Quiz Result',
        text: text,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(text);
      alert(t.common.copied || 'Result copied to clipboard!');
    }
  };

  if (isLoading || !quiz || !submittedQuiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const correctAnswers = submittedQuiz.answers?.filter(
    (answer, index) => answer === quiz.questions[index].correctAnswer
  ).length || 0;

  const incorrectAnswers = quiz.questions.length - correctAnswers;

  const timeTaken = submittedQuiz.timeSpent;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

 

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/5 via-background to-muted/50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-3 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-foreground/80" />
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              {quiz.title}
            </h1>
          </div>

          <button
            onClick={shareResult}
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-primary to-primary-dark text-white rounded-xl hover:from-primary-hover hover:to-primary-dark transition-all shadow-md hover:shadow-primary/30"
          >
            <Share2 className="w-5 h-5" />
            {t.common.share}
          </button>
        </div>

        {/* Main Result Card */}
        <div className="bg-card rounded-3xl shadow-2xl border border-border/50 overflow-hidden mb-10">
          <div className="p-8 md:p-12 text-center">
            <div className="inline-block p-6 bg-primary/10 rounded-full mb-8">
              <Award className="w-16 h-16 text-primary" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {getScoreMessage(submittedQuiz.score)}
            </h1>

            <div className="relative w-56 md:w-64 h-64 mx-auto mb-10">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-muted/50 dark:text-muted/30"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(submittedQuiz.score / 100) * 283} 283`}
                  transform="rotate(-90 50 50)"
                  className={getScoreColor(submittedQuiz.score)}
                />
                <text
                  x="50"
                  y="50"
                  textAnchor="middle"
                  dy="0.3em"
                  className={`text-2xl md:text-2xl font-bold ${getScoreColor(submittedQuiz.score)}`}
                >
                  {submittedQuiz.score}%
                </text>
              </svg>
            </div>

            <p className="text-xl text-foreground/80 mb-10">
              {t.results.completedBy || 'Completed by'} {submittedQuiz.studentName}
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-10">
              <div className="bg-green-500/5 rounded-2xl p-6 border border-green-500/20">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
                  <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {correctAnswers}
                  </span>
                </div>
                <div className="text-sm text-foreground/80">
                  {t.quiz.correctAnswers}
                </div>
              </div>

              <div className="bg-red-500/5 rounded-2xl p-6 border border-red-500/20">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <XCircle className="w-7 h-7 text-red-600 dark:text-red-400" />
                  <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {incorrectAnswers}
                  </span>
                </div>
                <div className="text-sm text-foreground/80">
                  {t.quiz.incorrectAnswers}
                </div>
              </div>

              {timeTaken != null && (
                <div className="bg-blue-500/5 rounded-2xl p-6 border border-blue-500/20">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Award className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {quiz?.timeLimit
                        ? formatTime(Math.max(0, quiz.timeLimit * 60 - timeTaken))
                        : formatTime(timeTaken)
                      }
                    </span>
                  </div>
                  <div className="text-sm text-foreground/80">
                    {quiz?.timeLimit ? t.quiz.timeRemaining : (t.quiz.timeTaken || 'Time Taken')}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleNewQuiz}
                className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-linear-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:from-primary-hover hover:to-primary-dark transition-all shadow-lg hover:shadow-primary/30"
              >
                {t.quiz.retakeQuiz}
              </button>

              <button
                onClick={() => setShowAnswers(!showAnswers)}
                className="inline-flex justify-center items-center gap-2 px-8 py-4 border border-primary text-primary rounded-xl hover:bg-primary/10 transition-all"
              >
                {showAnswers ? t.quiz.hideAnswers : t.quiz.showAnswers}
              </button>

              <Link
                href="/"
                className="inline-flex justify-center items-center gap-2 px-8 py-4 border border-border text-foreground/90 rounded-xl hover:bg-muted transition-all"
              >
                <Home className="w-5 h-5" />
                {t.common.home}
              </Link>
            </div>
          </div>
        </div>

        {/* Anonymous User Warning */}
        {!isLoggedIn && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mb-10">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-amber-600 text-lg">⚠️</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  {language === 'ar' ? 'تنبيه: هذه النتيجة غير محفوظة!' : 'Notice: This result is not saved!'}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {language === 'ar'
                    ? 'بما أنك لم تسجل دخولك، فإن هذه النتيجة لن تكون متاحة بعد مغادرة الصفحة. سجل دخولك لحفظ نتائجك ومراجعتها لاحقاً.'
                    : 'Since you didn\'t log in, this result won\'t be available after leaving the page. Login to save your results and review them later.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Answers */}
        {showAnswers && (
          <div className="bg-card rounded-3xl shadow-2xl border border-border/50 p-8">
            <h3 className="text-2xl font-bold text-foreground mb-8 text-center md:text-left">
              {t.quiz.yourAnswers}
            </h3>

            <div className="space-y-8">
              {quiz.questions.map((question: Question, index: number) => {
                const studentAnswer = submittedQuiz.answers?.[index] ?? -1;
                const isCorrect = studentAnswer === question.correctAnswer;

                return (
                  <div
                    key={index}
                    className={`p-6 rounded-2xl border ${isCorrect
                        ? 'bg-green-500/5 border-green-500/30'
                        : 'bg-red-500/5 border-red-500/30'
                      }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                            }`}
                        >
                          {index + 1}
                        </div>
                        <span className="text-lg font-medium text-foreground">
                          {question.questionText}
                        </span>
                      </div>
                      <span
                        className={`px-4 py-1.5 rounded-full text-sm font-medium ${isCorrect
                            ? 'bg-green-500/20 text-green-700 dark:text-green-300'
                            : 'bg-red-500/20 text-red-700 dark:text-red-300'
                          }`}
                      >
                        {isCorrect ? t.results.correct : t.results.incorrect}
                      </span>
                    </div>

                    <div className="space-y-3 ml-0 sm:ml-14">
                      {question.choices.map((choice: string, choiceIndex: number) => {
                        let bgClass = 'bg-muted/50 border-border';
                        let textClass = 'text-foreground/90';
                        let mark = null;

                        if (choiceIndex === question.correctAnswer) {
                          bgClass = 'bg-green-500/10 border-green-500/30';
                          textClass = 'text-green-700 dark:text-green-300';
                          mark = <CheckCircle className="w-5 h-5 text-green-600" />;
                        } else if (choiceIndex === studentAnswer) {
                          bgClass = 'bg-red-500/10 border-red-500/30';
                          textClass = 'text-red-700 dark:text-red-300';
                          mark = <XCircle className="w-5 h-5 text-red-600" />;
                        }

                        return (
                          <div
                            key={choiceIndex}
                            className={`p-4 rounded-xl border ${bgClass} ${textClass}`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold">
                                  {String.fromCharCode(65 + choiceIndex)}
                                </div>
                                <span>{choice}</span>
                              </div>
                              {mark && <div>{mark}</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Performance Tips */}
        <div className="bg-card/50 rounded-3xl border border-border/50 p-8 mt-10">
          <h4 className="text-xl font-semibold text-foreground mb-6 text-center md:text-left">
            {t.results.performanceTips}
          </h4>
          <ul className="space-y-3 text-foreground/80 list-disc list-inside md:list-outside md:pl-6">
            {submittedQuiz.score < 70 ? (
              <>
                <li>{t.results.tipReview || 'Review the questions you answered incorrectly'}</li>
                <li>{t.results.tipReadCarefully || 'Take your time to read each question carefully'}</li>
                <li>{t.results.tipEliminateWrong || 'Eliminate obviously wrong answers first'}</li>
                <li>{t.results.tipRetake || 'Consider retaking the quiz to improve your score'}</li>
              </>
            ) : (
              <>
                <li>{t.results.tipGreatWork || 'Great work! You have a solid understanding of the material'}</li>
                <li>{t.results.tipReviewMissed || 'Review any questions you missed for complete mastery'}</li>
                <li>{t.results.tipChallenge || 'Consider challenging yourself with more difficult quizzes'}</li>
                <li>{t.results.tipShare || 'Share your results with others!'}</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
