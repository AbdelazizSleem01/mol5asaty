'use client';

import { useUIStore } from '@/store/uiStore';
import { Sun, Moon } from 'lucide-react'; 

export function ThemeToggle() {
  const { theme, toggleTheme } = useUIStore();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2.5 rounded-full
        bg-muted/60 hover:bg-muted/80
        border border-border/50 hover:border-primary/40
        text-foreground/90 hover:text-primary
        transition-all duration-300
        shadow-sm hover:shadow-md
        group
        cursor-pointer
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        <Sun
          className={`
            w-6 h-6 text-yellow-500 transition-all duration-500 ease-in-out
            ${theme === 'light' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-0'}
          `}
        />
        <Moon
          className={`
            absolute w-6 h-6 text-blue-400 transition-all duration-500 ease-in-out
            ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}
          `}
        />
      </div>

      <div
        className="
          absolute -bottom-1 left-1/2 transform -translate-x-1/2 
          w-1.5 h-1.5 bg-primary rounded-full 
          opacity-0 group-hover:opacity-100 
          transition-opacity duration-300
        "
      />
    </button>
  );
}