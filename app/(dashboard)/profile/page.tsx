'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useUIStore } from '@/store/uiStore';
import { translations } from '@/lib/i18n';
import { User as UserIcon, Save, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { User } from '@/types';

const MySwal = withReactContent(Swal);

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const { language } = useUIStore();
  const router = useRouter();
  const t = translations[language];
  const isRTL = language === 'ar';

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/profile', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setFormData(prev => ({
          ...prev,
          name: data.user.name || ''
        }));
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      MySwal.fire({
        icon: 'error',
        title: <span className="text-red-600 dark:text-red-400">{t.common.error}</span>,
        text: error instanceof Error ? error.message : 'Failed to load profile',
        confirmButtonText: t.common.ok,
        confirmButtonColor: 'var(--color-primary)',
        background: 'var(--color-card)',
        color: 'var(--color-foreground)'
      });
    } finally {
      setIsLoading(false);
    }
  }, [t.common.error, t.common.ok]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      MySwal.fire({
        icon: 'error',
        title: <span className="text-red-600 dark:text-red-400">{t.common.error}</span>,
        text: isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match',
        confirmButtonText: t.common.ok,
        confirmButtonColor: 'var(--color-primary)',
        background: 'var(--color-card)',
        color: 'var(--color-foreground)'
      });
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setFormData({
          name: data.user.name || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

        MySwal.fire({
          icon: 'success',
          title: <span className="text-green-600 dark:text-green-400">
            {isRTL ? '✅ تم التحديث' : '✅ Updated'}
          </span>,
          text: isRTL ? 'تم تحديث الملف الشخصي بنجاح' : 'Profile updated successfully',
          confirmButtonText: t.common.ok,
          confirmButtonColor: 'var(--color-primary)',
          background: 'var(--color-card)',
          color: 'var(--color-foreground)',
          timer: 2000
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      MySwal.fire({
        icon: 'error',
        title: <span className="text-red-600 dark:text-red-400">{t.common.error}</span>,
        text: error instanceof Error ? error.message : 'Failed to update profile',
        confirmButtonText: t.common.ok,
        confirmButtonColor: 'var(--color-primary)',
        background: 'var(--color-card)',
        color: 'var(--color-foreground)'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-foreground/70">{t.common.loading}...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-3 rounded-xl hover:bg-muted/50 transition-colors"
          title={t.common.back}
        >
          <ArrowLeft className="w-6 h-6 text-foreground/80" />
        </button>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            {isRTL ? 'الملف الشخصي' : 'Profile'}
          </h1>
          <p className="text-lg text-foreground/80 mt-1">
            {isRTL ? 'إدارة معلوماتك الشخصية' : 'Manage your personal information'}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-3xl shadow-xl border border-border/50 p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-linear-to-br from-primary/20 to-primary-dark/20 rounded-full flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {user?.name || user?.email}
              </h2>
              <p className="text-foreground/70">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                {isRTL ? 'الاسم' : 'Name'}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder={isRTL ? 'أدخل اسمك' : 'Enter your name'}
              />
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                {isRTL ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl cursor-not-allowed opacity-60"
              />
              <p className="text-xs text-foreground/60">
                {isRTL ? 'لا يمكن تغيير البريد الإلكتروني' : 'Email cannot be changed'}
              </p>
            </div>

            {/* Current Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                {isRTL ? 'كلمة المرور الحالية' : 'Current Password'}
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-4 py-3 pr-12 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder={isRTL ? 'أدخل كلمة المرور الحالية' : 'Enter current password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground transition-colors"
                >
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                {isRTL ? 'كلمة المرور الجديدة' : 'New Password'} ({isRTL ? 'اختياري' : 'Optional'})
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-4 py-3 pr-12 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder={isRTL ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground transition-colors"
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                {isRTL ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-3 pr-12 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder={isRTL ? 'أعد إدخال كلمة المرور الجديدة' : 'Re-enter new password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground transition-colors"
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-border">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-linear-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:from-primary-hover hover:to-primary-dark transition-all shadow-lg hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>{isRTL ? 'حفظ التغييرات' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
