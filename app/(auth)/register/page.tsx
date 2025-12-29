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
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { register } = useAuthStore();
  const { language, theme } = useUIStore();
  const router = useRouter();
  const t = translations[language];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      MySwal.fire({
        icon: 'error',
        title: t.common.error,
        text: t.auth.passwordMismatch,
        background: theme === 'dark' ? '#0f172a' : '#ffffff',
        color: theme === 'dark' ? '#f8fafc' : '#0f172a',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    if (password.length < 6) {
      MySwal.fire({
        icon: 'error',
        title: t.common.error,
        text: t.auth.passwordTooShort || 'Password must be at least 6 characters',
        background: theme === 'dark' ? '#0f172a' : '#ffffff',
        color: theme === 'dark' ? '#f8fafc' : '#0f172a',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    setIsLoading(true);

    try {
      await register(name, email, password);

      MySwal.fire({
        icon: 'success',
        title: t.auth.registerSuccess || 'Registration successful',
        text: t.auth.welcome,
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
        background: theme === 'dark' ? '#0f172a' : '#ffffff',
        color: theme === 'dark' ? '#f8fafc' : '#0f172a',
      });

      router.push('/dashboard');
    } catch (err: any) {
      const errorMessage = err.message || t.auth.registrationFailed || 'Registration failed';
      setError(errorMessage);

      MySwal.fire({
        icon: 'error',
        title: t.auth.registrationFailed,
        text: errorMessage,
        background: theme === 'dark' ? '#0f172a' : '#ffffff',
        color: theme === 'dark' ? '#f8fafc' : '#0f172a',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          <div className="bg-card/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-border p-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="absolute -inset-4 bg-linear-to-r from-primary/10 to-primary-dark/10 blur-2xl rounded-full"></div>
                <h1 className="relative text-3xl font-bold bg-linear-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  {t.auth.register}
                </h1>
              </div>
              <p className="">
                {t.auth.hasAccount}{' '}
                <Link href="/login" className="font-semibold text-primary hover:text-primary-hover transition-colors">
                  {t.auth.login}
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold ">
                  {t.auth.name}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 " />
                  </div>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-foreground transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold ">
                  {t.auth.email}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 " />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-foreground transition-all"
                    placeholder="you@example.com"
                    required
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold ">
                  {t.auth.password}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 " />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-foreground transition-all"
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
                      <EyeOff className="h-5 w-5  hover:text-foreground" />
                    ) : (
                      <Eye className="h-5 w-5  hover:text-foreground" />
                    )}
                  </button>
                </div>
                <p className="text-xs ">
                  {t.auth.passwordMinChars || 'Must be at least 6 characters'}
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold ">
                  {t.auth.confirmPassword}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 " />
                  </div>                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-foreground transition-all"
                    placeholder="••••••••"
                    required
                    dir="ltr"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5  hover:text-foreground" />
                    ) : (
                      <Eye className="h-5 w-5  hover:text-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 h-5 w-5 rounded border-border text-primary focus:ring-primary"
                  required
                />
                <label htmlFor="terms" className="text-sm ">
                  {t.auth.agreeTo}{' '}
                  <Link href="/terms" className="text-primary hover:text-primary-hover">
                    {t.auth.terms}
                  </Link>{' '}
                  {t.auth.and}{' '}
                  <Link href="/privacy" className="text-primary hover:text-primary-hover">
                    {t.auth.privacy}
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
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
                  t.auth.register
                )}
              </button>

              {/* Divider */}
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

              {/* Google Button */}
              <button
                type="button"
                className="w-full px-4 py-3.5 border-2 border-border bg-card rounded-xl hover:bg-muted transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 shadow-md hover:shadow-lg flex items-center justify-center gap-3"
                onClick={() => {
                  MySwal.fire({
                    title: t.auth.googleSignup,
                    text: t.auth.googleFeatureComing,
                    icon: 'info',
                    confirmButtonText: t.common.ok,
                    background: theme === 'dark' ? '#0f172a' : '#ffffff',
                    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                    confirmButtonColor: '#3b82f6',
                  });
                }}
              >
                <FcGoogle className="w-5 h-5" />
                <span className="font-semibold ">
                  {t.auth.continueWithGoogle}
                </span>
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-border">
        <p className="text-sm ">
          © {new Date().getFullYear()} QuizMaster. {t.common.allRightsReserved}.
        </p>
      </footer>
    </div>
  );
}
