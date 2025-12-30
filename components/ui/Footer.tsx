'use client';

import Link from 'next/link';
import { useUIStore } from '@/store/uiStore';
import { translations } from '@/lib/i18n';
import { Mail, Github, Twitter, Heart } from 'lucide-react';

export function Footer() {
  const { language } = useUIStore();
  const t = translations[language];
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-white border-t border-blue-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="text-2xl font-bold text-blue-400 mb-4 hover:text-blue-300 transition-colors">
              Mokta&apos;b | مكتئب 
            </div>
            <p className="text-slate-300 mb-4 max-w-md leading-relaxed">
              {t.home.subtitle}
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <a
                href="https://github.com"
                className="text-slate-400 hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-slate-800"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                className="text-slate-400 hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-slate-800"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@Mokta'b|مكتئب .com"
                className="text-slate-400 hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-slate-800"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-400">{t.footer.quickLinks}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-slate-300 hover:text-blue-400 transition-colors hover:translate-x-1 transform duration-200 inline-block"
                >
                  {t.common.home}
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-slate-300 hover:text-blue-400 transition-colors hover:translate-x-1 transform duration-200 inline-block"
                >
                  {t.dashboard.title}
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-slate-300 hover:text-blue-400 transition-colors hover:translate-x-1 transform duration-200 inline-block"
                >
                  {t.auth.login}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-400">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/help"
                  className="text-slate-300 hover:text-blue-400 transition-colors hover:translate-x-1 transform duration-200 inline-block"
                >
                  {t.footer.helpCenter}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-slate-300 hover:text-blue-400 transition-colors hover:translate-x-1 transform duration-200 inline-block"
                >
                  {t.auth.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-slate-300 hover:text-blue-400 transition-colors hover:translate-x-1 transform duration-200 inline-block"
                >
                  {t.auth.termsOfService}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-slate-400 text-sm mb-4 md:mb-0">
              © {currentYear} Mokta&apos;b | مكتئب . {t.footer.allRightsReserved}
            </div>
            <div className="flex items-center text-slate-400 text-sm">
              Made with <Heart className="w-4 h-4 text-red-500 mx-1 animate-pulse" /> for education
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
