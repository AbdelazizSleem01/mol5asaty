'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { translations } from '@/lib/i18n';
import { FcGoogle } from 'react-icons/fc';
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineMail, AiOutlineLock } from 'react-icons/ai';
import { FiAlertCircle } from 'react-icons/fi';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { login } = useAuthStore();
  const { language, theme } = useUIStore();
  const router = useRouter();
  const t = translations[language];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      MySwal.fire({
        icon: 'error',
        title: t.common.error,
        text: t.auth.invalidEmail,
        background: theme === 'dark' ? '#0f172a' : '#ffffff',
        color: theme === 'dark' ? '#f8fafc' : '#0f172a',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);

      MySwal.fire({
        icon: 'success',
        title: t.auth.loginSuccess,
        text: t.auth.welcomeBack,
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
        background: theme === 'dark' ? '#0f172a' : '#ffffff',
        color: theme === 'dark' ? '#f8fafc' : '#0f172a',
      });

      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (err: any) {
      const errorMessage = err.message || t.auth.loginFailed;
      setError(errorMessage);

      MySwal.fire({
        icon: 'error',
        title: t.auth.loginFailed,
        text: errorMessage,
        background: theme === 'dark' ? '#0f172a' : '#ffffff',
        color: theme === 'dark' ? '#f8fafc' : '#0f172a',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    MySwal.fire({
      title: t.auth.googleLogin,
      text: t.auth.redirectingToGoogle,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: t.common.continue,
      cancelButtonText: t.common.cancel,
      background: theme === 'dark' ? '#0f172a' : '#ffffff',
      color: theme === 'dark' ? '#f8fafc' : '#0f172a',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#64748b',
    }).then((result) => {
      if (result.isConfirmed) {
        MySwal.fire({
          title: t.common.underDevelopment,
          text: t.auth.googleFeatureComing,
          icon: 'warning',
          background: theme === 'dark' ? '#0f172a' : '#ffffff',
          color: theme === 'dark' ? '#f8fafc' : '#0f172a',
          confirmButtonColor: '#3b82f6',
        });
      }
    });
  };

  const handleForgotPassword = () => {
    MySwal.fire({
      title: t.auth.resetPassword,
      html: `
        <div class="text-left space-y-4">
          <p class="text-sm text-gray-600 dark:text-gray-300">${t.auth.resetPasswordInstructions}</p>
          <input 
            type="email" 
            id="reset-email" 
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="${t.auth.email}"
            value="${email}"
          />
        </div>
      `,
      background: theme === 'dark' ? '#0f172a' : '#ffffff',
      color: theme === 'dark' ? '#f8fafc' : '#0f172a',
      showCancelButton: true,
      confirmButtonText: t.auth.sendResetLink,
      cancelButtonText: t.common.cancel,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#64748b',
      preConfirm: () => {
        const emailInput = document.getElementById('reset-email') as HTMLInputElement;
        if (!emailInput.value || !emailInput.value.includes('@')) {
          MySwal.showValidationMessage(t.auth.validEmailRequired);
          return false;
        }
        return emailInput.value;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        MySwal.fire({
          title: t.common.success,
          text: t.auth.resetLinkSent,
          icon: 'success',
          background: theme === 'dark' ? '#0f172a' : '#ffffff',
          color: theme === 'dark' ? '#f8fafc' : '#0f172a',
          confirmButtonColor: '#3b82f6',
        });
      }
    });
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          <div className="bg-card/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-border p-8 space-y-8">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="absolute -inset-4 bg-linear-to-r from-primary/10 to-primary-dark/10 blur-2xl rounded-full"></div>
                <h1 className="relative text-3xl font-bold bg-linear-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  {t.auth.login}
                </h1>
              </div>
              <p className="">
                {t.auth.noAccount}{' '}
                <Link
                  href="/register"
                  className="font-semibold text-primary hover:text-primary-hover transition-colors"
                >
                  {t.auth.register}
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <FiAlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold ">
                  {t.auth.email}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AiOutlineMail className="h-5 w-5 " />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-foreground transition-all"
                    placeholder="you@example.com"
                    required
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="block text-sm font-semibold ">
                    {t.auth.password}
                  </label>
                  <button
                    type="button"
                    className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                    onClick={handleForgotPassword}
                  >
                    {t.auth.forgotPassword}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AiOutlineLock className="h-5 w-5 " />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-foreground transition-all"
                    placeholder="••••••••"
                    required
                    dir="ltr"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible className="h-5 w-5  hover:text-foreground" />
                    ) : (
                      <AiOutlineEye className="h-5 w-5  hover:text-foreground" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden px-4 py-3.5 bg-linear-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:from-primary-hover hover:to-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg hover:shadow-primary/25"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t.common.loading}</span>
                  </div>
                ) : (
                  t.auth.login
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-card text-sm  font-medium">
                    {t.auth.orContinueWith}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="w-full px-4 py-3.5 border-2 border-border bg-card rounded-xl hover:bg-muted transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 shadow-md hover:shadow-lg flex items-center justify-center gap-3"
                onClick={handleGoogleLogin}
              >
                <FcGoogle className="w-5 h-5" />
                <span className="font-semibold ">
                  {t.auth.continueWithGoogle}
                </span>
              </button>

              <p className="text-xs text-center  px-4">
                {t.auth.byContinuing}{' '}
                <Link href="/terms" className="text-primary hover:text-primary-hover">
                  {t.auth.terms}
                </Link>{' '}
                {t.auth.and}{' '}
                <Link href="/privacy" className="text-primary hover:text-primary-hover">
                  {t.auth.privacy}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center">
        <p className="text-sm ">
          © {new Date().getFullYear()} QuizMaster. {t.common.allRightsReserved}.
        </p>
      </footer>
    </div>
  );
}
