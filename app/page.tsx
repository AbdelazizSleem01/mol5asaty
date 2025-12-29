'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Navbar } from '@/components/ui/Navbar';
import { translations } from '@/lib/i18n';
import { ArrowRight, BookOpen, Users, BarChart3, Zap, Trophy, Globe } from 'lucide-react';
import { Footer } from '@/components/ui/Footer';

export default function Home() {
  const { user } = useAuthStore();
  const { language } = useUIStore();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-linear-to-br from-primary/5 via-background to-muted/50">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-extrabold mb-8 bg-linear-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                {t.home.title}
              </h1>
              <p className="text-xl md:text-2xl mb-10  leading-relaxed">
                {t.home.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                {user ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center px-8 py-4 bg-linear-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:from-primary-hover hover:to-primary/50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-primary/30"
                  >
                    {t.dashboard.title}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="inline-flex items-center px-8 py-4 bg-linear-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:from-primary-hover hover:to-primary/50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-primary/30"
                    >
                      {t.home.getStarted}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex items-center px-8 py-4 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary/10 transition-all duration-300 transform hover:scale-105"
                    >
                      {t.auth.login}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-card/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-linear-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                {t.home.features}
              </h2>
              <p className="text-xl  max-w-3xl mx-auto">
                {t.home.featuresSubtitle || 'Everything you need to create, manage, and take quizzes effectively'}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-3xl bg-linear-to-br from-primary/5 to-muted/30 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  {t.home.forTeachers}
                </h3>
                <p className=" leading-relaxed">
                  {t.home.teachersDesc}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-3xl bg-linear-to-br from-primary/5 to-muted/30 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  {t.home.forStudents}
                </h3>
                <p className=" leading-relaxed">
                  {t.home.studentsDesc}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-3xl bg-linear-to-br from-primary/5 to-muted/30 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  {t.home.analytics}
                </h3>
                <ul className="space-y-3 ">
                  {t.home.featuresList?.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-linear-to-r from-primary to-primary-dark text-white">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-10 text-center">
              <div className="p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                <div className="text-5xl font-bold mb-3">1000+</div>
                <div className="text-lg opacity-90">Active Users</div>
              </div>
              <div className="p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                <div className="text-5xl font-bold mb-3">5000+</div>
                <div className="text-lg opacity-90">Quizzes Created</div>
              </div>
              <div className="p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                <div className="text-5xl font-bold mb-3">25K+</div>
                <div className="text-lg opacity-90">Questions Answered</div>
              </div>
              <div className="p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                <div className="text-5xl font-bold mb-3">4.8/5</div>
                <div className="text-lg opacity-90">User Rating</div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}