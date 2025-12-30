'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';

export function Providers({ children }: { children: React.ReactNode }) {
  const { theme, language } = useUIStore();
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [theme, language]);
  
  return <>{children}</>;
}