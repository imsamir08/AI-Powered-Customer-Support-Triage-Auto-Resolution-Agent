import { Bell, Bug, MoonStar, SunMedium } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export function Navbar() {
  const { user } = useAuth();
  const { mode, setMode } = useTheme();
  const [showAlerts, setShowAlerts] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-300/30">
            <Bug className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--text-muted)]">BugCraft AI</p>
            <h1 className="text-base font-semibold text-[var(--text-primary)]">Issue command</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Toggle theme"
            onClick={() => {
              const nextMode = mode === 'dark' ? 'light' : mode === 'light' ? 'system' : 'dark';
              const root = document.documentElement;
              const resolvedTheme = nextMode === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : nextMode;

              root.dataset.theme = resolvedTheme;
              root.style.colorScheme = resolvedTheme;
              localStorage.setItem('bugcraft-theme', nextMode);
              setMode(nextMode);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] text-[var(--text-primary)] transition hover:border-indigo-500/60"
          >
            {mode === 'light' ? <MoonStar className="h-5 w-5" /> : <SunMedium className="h-5 w-5" />}
          </button>

          <button
            type="button"
            onClick={() => setShowAlerts((previous) => !previous)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] text-[var(--text-primary)] transition hover:border-indigo-500/60"
            aria-label="Toggle notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </button>

          {showAlerts && (
            <div className="absolute right-4 top-16 z-50 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-xl md:right-6">
              <p className="text-sm font-medium text-[var(--text-primary)]">3 new alerts</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">Two incidents updated and one deployment succeeded.</p>
            </div>
          )}

          <NavLink to="/profile" className="ml-2 flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-2 text-left transition hover:border-indigo-500/60">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-xs font-semibold text-white">
              {user?.avatar ?? 'AD'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-[var(--text-primary)]">{user?.name ?? 'Operator'}</p>
              <p className="text-xs text-[var(--text-secondary)]">{user?.role ?? 'DEVELOPER'}</p>
            </div>
          </NavLink>
        </div>
      </div>
    </header>
  );
}
