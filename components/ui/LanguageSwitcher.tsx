'use client';

import { useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import Image from 'next/image';

export function LanguageSwitcher() {
  const { language, setLanguage } = useUIStore();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const selectLanguage = (lang: 'ar' | 'en') => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block mx-2">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-full bg-muted/50 hover:bg-muted border border-border/50 hover:border-primary/40 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {language === 'ar' ? (
          <Image src="/flags/sa.svg" alt="Arabic" width={24} height={24} className="rounded-full" />
        ) : (
          <Image src="/flags/us.svg" alt="English" width={24} height={24} className="rounded-full" />
        )}
        <span className="text-sm font-medium text-foreground/90">
          {language === 'ar' ? 'العربية' : 'English'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-background border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          <button
            onClick={() => selectLanguage('ar')}
            className={`w-full flex items-center cursor-pointer gap-3 px-4 py-3 hover:bg-muted transition-colors text-left ${
              language === 'ar' ? 'bg-primary/10 text-primary' : ''
            }`}
          >
            <Image src="/flags/sa.svg" alt="Arabic" width={28} height={28} className="rounded-full" />
            <span className="font-medium">العربية</span>
          </button>
          <button
            onClick={() => selectLanguage('en')}
            className={`w-full flex items-center cursor-pointer gap-3 px-4 py-3 hover:bg-muted transition-colors text-left ${
              language === 'en' ? 'bg-primary/10 text-primary' : ''
            }`}
          >
            <Image src="/flags/us.svg" alt="English" width={28} height={28} className="rounded-full" />
            <span className="font-medium">English</span>
          </button>
        </div>
      )}
    </div>
  );
}