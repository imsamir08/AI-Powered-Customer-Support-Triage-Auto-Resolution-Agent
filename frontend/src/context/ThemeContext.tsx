import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { ThemeMode } from '../types';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('bugcraft-theme');
    if (saved === 'system' || saved === 'dark' || saved === 'light') {
      return saved;
    }

    return 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const resolvedTheme = mode === 'system' ? (mediaQuery.matches ? 'dark' : 'light') : mode;

    root.dataset.theme = resolvedTheme;
    root.style.colorScheme = resolvedTheme;
    localStorage.setItem('bugcraft-theme', mode);

    const changeListener = () => {
      if (mode === 'system') {
        root.dataset.theme = mediaQuery.matches ? 'dark' : 'light';
        root.style.colorScheme = mediaQuery.matches ? 'dark' : 'light';
      }
    };

    mediaQuery.addEventListener('change', changeListener);
    return () => mediaQuery.removeEventListener('change', changeListener);
  }, [mode]);

  const value = useMemo(() => ({ mode, setMode }), [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return context;
}
