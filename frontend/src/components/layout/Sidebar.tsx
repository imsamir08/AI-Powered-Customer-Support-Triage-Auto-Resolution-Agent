import { Activity, BookOpen, BrainCircuit, ClipboardList, FileSearch, LayoutDashboard, ServerCog, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const developerLinks = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/ai-triage', label: 'AI Triage', icon: BrainCircuit },
  { to: '/kanban', label: 'Kanban', icon: ClipboardList },
  { to: '/bugs', label: 'Directory', icon: FileSearch },
  { to: '/profile', label: 'Profile', icon: Settings },
];

const adminLinks = [{ to: '/admin', label: 'Admin', icon: ServerCog }];

export function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <aside className="hidden w-64 shrink-0 border-r border-[var(--border)] bg-[var(--canvas)]/90 p-4 lg:block">
      <div className="space-y-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
          <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">Workspace</p>
          <div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
            <Activity className="h-4 w-4 text-emerald-400" />
            System stable • 99.98%
          </div>
        </div>

        <nav className="space-y-2">
          {developerLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  isActive ? 'bg-indigo-500/15 text-[var(--text-primary)] ring-1 ring-indigo-500/40' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-alt)] hover:text-[var(--text-primary)]'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        {isAdmin && (
          <div className="space-y-2 border-t border-[var(--border)] pt-4">
            <p className="px-2 text-[10px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">Admin</p>
            {adminLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    isActive ? 'bg-amber-500/15 text-amber-800 ring-1 ring-amber-500/40 dark:text-amber-100' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-alt)] hover:text-[var(--text-primary)]'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </div>
        )}

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text-secondary)]">
          <div className="mb-2 flex items-center gap-2 text-[var(--text-primary)]">
            <BookOpen className="h-4 w-4 text-indigo-400" />
            Guardrail Notes
          </div>
          <p className="text-xs leading-5 text-[var(--text-secondary)]">
            All status transitions require confirmation to keep response workflows traceable.
          </p>
        </div>
      </div>
    </aside>
  );
}
