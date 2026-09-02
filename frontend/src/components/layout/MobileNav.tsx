import { BrainCircuit, ClipboardList, FileSearch, LayoutDashboard, ShieldCheck, UserRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const items = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/ai-triage', label: 'AI', icon: BrainCircuit },
  { to: '/kanban', label: 'Kanban', icon: ClipboardList },
  { to: '/bugs', label: 'Directory', icon: FileSearch },
  { to: '/profile', label: 'Profile', icon: UserRound },
  { to: '/admin', label: 'Admin', icon: ShieldCheck },
];

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--surface)]/90 px-2 py-2 backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-5 gap-2">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] transition ${
                isActive ? 'bg-indigo-500/15 text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
