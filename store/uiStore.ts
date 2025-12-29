// store/uiStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  theme: 'light' | 'dark';
  language: 'en' | 'ar';
  toggleTheme: () => void;
  setLanguage: (lang: 'en' | 'ar') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'light', 
      language: 'en',
      
      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
      },
      
      setLanguage: (lang: 'en' | 'ar') => {
        set({ language: lang });
      },
    }),
    {
      name: 'ui-storage',
    }
  )
);
