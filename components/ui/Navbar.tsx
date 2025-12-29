'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { translations } from '@/lib/i18n';
import { Home, LayoutDashboard, LogOut, Menu, X, User, ChevronDown } from 'lucide-react';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();
  const { language } = useUIStore();
  const router = useRouter();
  const t = translations[language];

  const getInitials = (name: string) => {
    const names = name.split(' ');
    return (names[0]?.[0] || '') + (names[1]?.[0] || '').toUpperCase();
  };

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  return (
    <nav className="bg-background/90 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="shrink-0">
            <Link
              href="/"
              className="flex items-center gap-3 group"
              onClick={closeMenu}
            >
              <div className="w-10 h-10 bg-linear-to-r from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-md group-hover:shadow-primary/30 transition-all">
                <span className="text-white font-bold text-xl">Q</span>
              </div>
              <span className="text-2xl font-bold bg-linear-to-r from-primary to-primary-dark bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                QuizMaster
              </span>
            </Link>
          </div>

          {/* Desktop Navigation (centered) */}
          <div className="hidden md:flex items-center justify-center flex-1 space-x-10 rtl:space-x-reverse">
            <Link
              href="/"
              className="flex items-center gap-2 text-foreground/90 hover:text-primary px-4 py-2 rounded-xl text-base font-medium transition-all hover:bg-muted/50"
            >
              <Home className="w-5 h-5" />
              {t.common.home}
            </Link>

            {user && (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-foreground/90 hover:text-primary px-4 py-2 rounded-xl text-base font-medium transition-all hover:bg-muted/50"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  {t.dashboard.title}
                </Link>
                {user.role === 'admin' && (
                  <Link
                    href="/users"
                    className="flex items-center gap-2 text-foreground/90 hover:text-primary px-4 py-2 rounded-xl text-base font-medium transition-all hover:bg-muted/50"
                  >
                    <User className="w-5 h-5" />
                    {t.admin.users}
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Desktop Right Controls */}
          <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
            <ThemeToggle />
            <LanguageSwitcher />

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-all duration-200"
                  title="User Menu"
                >
                  <div className="w-10 h-10 bg-linear-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                    {getInitials(user.name || user.email?.split('@')[0] || '')}
                  </div>
                  <ChevronDown className="w-4 h-4 text-foreground/60" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-3 w-72 bg-card rounded-2xl shadow-2xl border border-border/50 py-3 z-50 overflow-hidden">
                    {/* User Info */}
                    <div className="px-5 py-4 border-b border-border">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-linear-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-semibold text-md shadow-md">
                          {getInitials(user.name || user.email?.split('@')[0] || '')}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-lg">{user.name}</p>
                          <p className="text-sm text-foreground/70">{user.email}</p>
                          <p className="text-xs text-foreground capitalize w-fit mt-1 bg-primary-dark rounded-full px-2 py-1">
                            {user.role || 'Student'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-5 py-3 text-base text-foreground/90 hover:bg-muted/50 hover:text-foreground transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        {t.dashboard.title}
                      </Link>

                      {user.role === 'admin' && (
                        <Link
                          href="/users"
                          className="flex items-center gap-3 px-5 py-3 text-base text-foreground/90 hover:bg-muted/50 hover:text-foreground transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="w-5 h-5" />
                          {t.admin.users}
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          handleLogout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-5 py-3 text-base text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        {t.auth.logout}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-4 rtl:space-x-reverse">
                <Link
                  href="/login"
                  className="px-6 py-2.5 border-2 border-primary text-primary font-medium rounded-xl hover:bg-primary/10 transition-all duration-300 text-base"
                >
                  {t.auth.login}
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2.5 bg-linear-to-r from-primary to-primary-dark text-white font-medium rounded-xl hover:from-primary-hover hover:to-primary-dark transition-all shadow-md hover:shadow-primary/30 text-base"
                >
                  {t.auth.register}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-3 rounded-xl hover:bg-muted/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-expanded={isMenuOpen}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-lg border-t border-border">
          <div className="px-4 py-6 space-y-6">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 text-foreground/90 hover:text-primary rounded-xl hover:bg-muted/50 transition-colors text-lg font-medium"
              onClick={closeMenu}
            >
              <Home className="w-5 h-5" />
              {t.common.home}
            </Link>

            {user && (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-4 py-3 text-foreground/90 hover:text-primary rounded-xl hover:bg-muted/50 transition-colors text-lg font-medium"
                  onClick={closeMenu}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  {t.dashboard.title}
                </Link>
                {user.role === 'admin' && (
                  <Link
                    href="/users"
                    className="flex items-center gap-3 px-4 py-3 text-foreground/90 hover:text-primary rounded-xl hover:bg-muted/50 transition-colors text-lg font-medium"
                    onClick={closeMenu}
                  >
                    <User className="w-5 h-5" />
                    {t.admin.users}
                  </Link>
                )}
              </>
            )}

            <div className="px-4 py-3 flex items-center justify-between border-t border-border mt-2">
              <span className="text-foreground/80 text-base font-medium">
                {t.common.theme}
              </span>
              <ThemeToggle />
            </div>

            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-foreground/80 text-base font-medium">
                {t.common.language}
              </span>
              <LanguageSwitcher />
            </div>

            {!user ? (
              <div className="space-y-4 px-4">
                <Link
                  href="/login"
                  className="block px-6 py-4 border-2 border-primary text-primary font-medium rounded-xl hover:bg-primary/10 transition-all text-center text-lg"
                  onClick={closeMenu}
                >
                  {t.auth.login}
                </Link>
                <Link
                  href="/register"
                  className="block px-6 py-4 bg-linear-to-r from-primary to-primary-dark text-white font-medium rounded-xl hover:from-primary-hover hover:to-primary-dark transition-all shadow-md text-center text-lg"
                  onClick={closeMenu}
                >
                  {t.auth.register}
                </Link>
              </div>
            ) : (
              <div className="space-y-4 px-4">
                <Link
                  href="/dashboard"
                  className="block px-6 py-4 bg-linear-to-r from-primary to-primary-dark text-white font-medium rounded-xl hover:from-primary-hover hover:to-primary-dark transition-all shadow-md text-center text-lg"
                  onClick={closeMenu}
                >
                  {t.dashboard.title}
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-3 shadow-md text-lg"
                >
                  <LogOut className="w-5 h-5" />
                  {t.auth.logout}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
