'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';
import { useUIStore } from '@/store/uiStore';
import { translations } from '@/lib/i18n';
import { Quiz } from '@/types';
import { Loader2, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import Image from 'next/image';

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [studentName, setStudentName] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [password, setPassword] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const { setCurrentQuiz, setStudentName: setStoreStudentName, setSubmittedQuiz, setQuizStartTime, setQuizEndTime, quizStartTime } = useQuizStore();
  const { language } = useUIStore();
  const t = translations[language];

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quiz/${params.slug}`);
        const data = await response.json();
        if (data.success) {
          setQuiz(data.quiz);
          setAnswers(new Array(data.quiz.questions.length).fill(-1));
          if (data.quiz.hasPassword) {
            setIsPasswordModalOpen(true);
          }
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

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/user/profile', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setStudentName(data.user.name);
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      } finally {
        setAuthChecked(true);
      }
    };

    // Small delay to ensure proper auth checking
    const timer = setTimeout(() => {
      checkAuthStatus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = useCallback(async () => {
    const endTime = new Date();
    setQuizEndTime(endTime);

    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          quizId: params.slug,
          studentName,
          answers,
          startTime: quizStartTime,
          endTime: endTime,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmittedQuiz(data.submission);
        router.push(`/quiz/${params.slug}/result`);
      } else {
        alert('Failed to submit quiz. Please try again.');
      }
    } catch {
      alert('Failed to submit quiz. Please try again.');
    }
  }, [params.slug, studentName, answers, quizStartTime, setQuizEndTime, setSubmittedQuiz, router]);

  useEffect(() => {
    if (hasStarted && timeLeft !== null && timeLeft > 0 && !isTimeUp) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev && prev <= 1) {
            setIsTimeUp(true);
            handleSubmit();
            return 0;
          }
          return prev ? prev - 1 : 0;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [hasStarted, timeLeft, isTimeUp, handleSubmit]);

  const handleVerifyPassword = async () => {
    if (!password.trim()) {
      setPasswordError(t.quiz.passwordRequired);
      return;
    }

    try {
      const response = await fetch(`/api/quiz/${params.slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (data.success && data.valid) {
        setIsPasswordModalOpen(false);
        setPasswordError('');
      } else {
        setPasswordError(t.quiz.incorrectPassword);
      }
  } catch {
      setPasswordError('Failed to verify password');
    }
  };

  const handleStartQuiz = () => {
    if (!studentName.trim()) return;

    setStoreStudentName(studentName);
    if (quiz) {
      setCurrentQuiz(quiz);
      setHasStarted(true);
      setQuizStartTime(new Date());

      if (quiz.timeLimit) {
        setTimeLeft(quiz.timeLimit * 60);
      }
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < (quiz?.questions.length ?? 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!quiz) return null;

  if (!hasStarted) {
    return (
      <>
        <div className="min-h-screen bg-linear-to-br from-primary/5 via-background to-muted/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl shadow-2xl border border-border/50 p-10 max-w-md w-full text-center">
            {quiz.thumbnail && (
              <div className="mb-6">
                <Image
                  src={quiz.thumbnail}
                  alt={quiz.displayName || quiz.title}
                  className="w-32 h-32 object-cover rounded-2xl mx-auto shadow-lg"
                  width={128}
                  height={128}
                  loading="eager"
               />
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-primary to-primary-dark bg-clip-text text-transparent mb-4">
              {quiz.title}
            </h1>
            {quiz.creatorName && (
              <p className="text-lg text-foreground/70 mb-2">
                Created by: {quiz.creatorName}
              </p>
            )}
            <p className="text-xl text-foreground/80 mb-8">
              {quiz.questions.length} {t.quiz.questions.toLowerCase()}
            </p>

            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold text-foreground/90">
                  {t.quiz.enterName}
                </label>
                <input
                  type="text"
                  id="name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-5 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-foreground transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>

              {/* Login Recommendation */}
              {authChecked && !isLoggedIn && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-amber-600 text-sm">⚠️</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                        {language === 'ar' ? 'تحذير: بدون تسجيل دخول، لن تتمكن من رؤية نتائجك لاحقاً!' : 'Warning: Without login, you cannot view your results later!'}
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        {language === 'ar'
                          ? 'إذا لم تسجل دخولك، ستتمكن من إجراء الاختبار لكن لن تتمكن من رؤية نتائجك أو مراجعة إجاباتك بعد مغادرة الصفحة'
                          : 'If you don\'t login, you can take the quiz but won\'t be able to view your results or review your answers after leaving the page'
                        }
                      </p>
                      <button
                        onClick={() => router.push('/login')}
                        className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-md transition-colors font-medium"
                      >
                        {language === 'ar' ? 'تسجيل الدخول' : 'Login Now'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleStartQuiz}
                disabled={!studentName.trim()}
                className="w-full px-6 py-4 bg-linear-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:from-primary-hover hover:to-primary-dark disabled:opacity-50 transition-all shadow-lg hover:shadow-primary/30 transform hover:scale-[1.02]"
              >
                {t.quiz.startQuiz}
              </button>
            </div>
          </div>
        </div>

        {/* Password Modal */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-3xl shadow-2xl border border-border/50 p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-center mb-6 text-foreground">
                {t.quiz.enterQuizPassword}
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="quizPassword" className="block text-sm font-semibold text-foreground/90">
                    {t.quiz.password}
                  </label>
                  <input
                    type="password"
                    id="quizPassword"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-foreground transition-all"
                    placeholder={t.quiz.password}
                    required
                  />
                  {passwordError && (
                    <p className="text-red-500 text-sm">{passwordError}</p>
                  )}
                </div>

                <button
                  onClick={handleVerifyPassword}
                  className="w-full px-6 py-3 bg-linear-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:from-primary-hover hover:to-primary-dark transition-all shadow-lg hover:shadow-primary/30"
                >
                  {t.quiz.verifyPassword}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  const currentQ = quiz.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Quiz Header Bar */}
        <div className="bg-card rounded-2xl shadow-lg border border-border/50 p-4 mb-6">
          <div className="flex items-center gap-4">
            {quiz.thumbnail && (
              <Image
                src={quiz.thumbnail}
                alt={quiz.displayName || quiz.title}
                width={48}
                height={48}
                loading="lazy"
                className="w-12 h-12 object-cover rounded-lg shadow-sm"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-foreground truncate">
                {quiz.title}
              </h2>
              {quiz.creatorName && quiz.creatorName !== 'Unknown' && (
                <p className="text-sm text-foreground/70 truncate">
                  by {quiz.creatorName}
                </p>
              )}
            </div>

            {/* Timer */}
            {timeLeft !== null && (
              <div className={`px-4 py-2 rounded-lg font-mono text-lg font-bold ${timeLeft <= 300 // 5 minutes
                ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                : timeLeft <= 600 
                  ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                  : 'bg-primary/10 text-primary'
                }`}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-3xl shadow-2xl border border-border/50 p-6 md:p-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <h1 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              {quiz.title}
            </h1>
            <div className="text-lg font-medium text-foreground/80">
              {t.quiz.questionNumber.replace('{number}', (currentQuestion + 1).toString())} / {quiz.questions.length}
            </div>
          </div>

          {/* Question */}
          <div className="mb-10">
            <h2 className="text-xl md:text-2xl font-semibold mb-6 text-foreground">
              {currentQ.questionText}
            </h2>

            <div className="space-y-4">
              {currentQ.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${answers[currentQuestion] === index
                    ? 'bg-primary/10 border-primary shadow-md'
                    : 'border-border hover:bg-muted/50 hover:border-primary/50'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${answers[currentQuestion] === index
                        ? 'bg-primary border-primary text-white'
                        : 'border-border text-foreground/70'
                        }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-lg text-foreground">{choice}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-border">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground/90 rounded-xl hover:bg-muted disabled:opacity-50 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              {t.common.previous}
            </button>

            {currentQuestion === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-8 py-3 bg-linear-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:from-primary-hover hover:to-primary-dark transition-all shadow-lg hover:shadow-primary/30"
              >
                {t.common.finish}
                <Check className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={answers[currentQuestion] === -1}
                className="inline-flex items-center gap-2 px-8 py-3 bg-linear-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:from-primary-hover hover:to-primary-dark disabled:opacity-50 transition-all shadow-lg hover:shadow-primary/30"
              >
                {t.common.next}
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Circles */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-medium transition-all ${index === currentQuestion
                ? 'bg-primary border-primary text-white shadow-md'
                : answers[index] !== -1
                  ? 'bg-green-500/20 border-green-500 text-green-700 dark:text-green-300'
                  : 'border-border text-foreground/70 hover:border-primary/50 hover:bg-muted/50'
                }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
