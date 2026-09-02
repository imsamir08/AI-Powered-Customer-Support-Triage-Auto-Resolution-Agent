import { useEffect, useMemo, useState } from 'react';
import { createBug, fetchAdminUsers, updateBug } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import type { BugItem, User } from '../../types';
import { Modal } from './Modal';

interface BugFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  initialBug?: BugItem;
  onSaved?: () => void;
}

const BUG_CATEGORIES = ['AUTHENTICATION', 'DATABASE', 'UI_UX', 'PERFORMANCE', 'SECURITY', 'API', 'DEVOPS', 'GENERAL'] as const;
const BUG_SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;
const BUG_PRIORITIES = ['P0', 'P1', 'P2', 'P3'] as const;
const BUG_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;

const buildEmptyForm = (currentUserId?: string) => ({
  title: '',
  rawDescription: '',
  category: 'GENERAL',
  severity: 'MEDIUM',
  priority: 'P2',
  status: 'OPEN',
  possibleCause: '',
  suggestedFix: '',
  assignedToId: currentUserId ?? '',
});

export function BugFormModal({ isOpen, onClose, mode, initialBug, onSaved }: BugFormModalProps) {
  const { user } = useAuth();
  const [form, setForm] = useState(() => buildEmptyForm(user?.id));
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const members = await fetchAdminUsers();
        setTeamMembers(Array.isArray(members) ? members : []);
      } catch {
        setTeamMembers([]);
      }
    };

    void loadMembers();
  }, []);

  const assigneeOptions = useMemo(() => {
    const options = new Map<string, string>();

    teamMembers.forEach((member) => {
      if (member.id) {
        options.set(member.id, member.name || member.email || 'Team member');
      }
    });

    if (user?.id && !options.has(user.id)) {
      options.set(user.id, user.name || 'Current user');
    }

    return [
      { label: 'Unassigned', value: '' },
      ...Array.from(options.entries()).map(([value, label]) => ({ label, value })),
    ];
  }, [teamMembers, user]);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && initialBug) {
      setForm({
        title: initialBug.title ?? '',
        rawDescription: initialBug.rawDescription ?? '',
        category: initialBug.category ?? 'GENERAL',
        severity: initialBug.severity ?? 'MEDIUM',
        priority: initialBug.priority ?? 'P2',
        status: initialBug.status ?? 'OPEN',
        possibleCause: initialBug.possibleCause ?? '',
        suggestedFix: initialBug.suggestedFix ?? '',
        assignedToId: initialBug.assignedToId ?? initialBug.assigneeId ?? user?.id ?? '',
      });
      return;
    }

    setForm(buildEmptyForm(user?.id));
  }, [isOpen, mode, initialBug, user?.id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload: Record<string, string | null> = {
        title: form.title,
        rawDescription: form.rawDescription,
        category: form.category,
        severity: form.severity,
        priority: form.priority,
        status: form.status,
        possibleCause: form.possibleCause,
        suggestedFix: form.suggestedFix,
        assignedToId: form.assignedToId || null,
      };

      if (mode === 'edit' && initialBug?.id) {
        await updateBug(initialBug.id, payload);
      } else {
        await createBug(payload);
      }

      onSaved?.();
      onClose();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Unable to save the ticket.';
      setError(message.includes('Network') || message.includes('ERR_NETWORK') ? 'Network error: check that the backend is running and try again.' : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'edit' ? 'Edit ticket' : 'Create new ticket'}>
      <form className="flex h-full flex-col gap-4 overflow-y-auto p-4 sm:p-5" onSubmit={handleSubmit}>
        <div className="flex-1 space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] p-4 shadow-inner shadow-slate-900/5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">Ticket title</label>
              <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-indigo-500">
                {mode === 'edit' ? 'Update' : 'New'}
              </span>
            </div>
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className="min-h-[48px] w-full rounded-xl border border-[var(--border)] bg-[var(--canvas)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Add a concise issue title"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] p-4 shadow-inner shadow-slate-900/5">
              <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">Category</label>
              <select
                value={form.category}
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                className="min-h-[46px] w-full rounded-xl border border-[var(--border)] bg-[var(--canvas)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {BUG_CATEGORIES.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] p-4 shadow-inner shadow-slate-900/5">
              <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">Status</label>
              <select
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                className="min-h-[46px] w-full rounded-xl border border-[var(--border)] bg-[var(--canvas)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {BUG_STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] p-4 shadow-inner shadow-slate-900/5">
              <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">Severity</label>
              <select
                value={form.severity}
                onChange={(event) => setForm((current) => ({ ...current, severity: event.target.value }))}
                className="min-h-[46px] w-full rounded-xl border border-[var(--border)] bg-[var(--canvas)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {BUG_SEVERITIES.map((severity) => (
                  <option key={severity} value={severity}>{severity}</option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] p-4 shadow-inner shadow-slate-900/5">
              <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">Priority</label>
              <select
                value={form.priority}
                onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                className="min-h-[46px] w-full rounded-xl border border-[var(--border)] bg-[var(--canvas)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {BUG_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] p-4 shadow-inner shadow-slate-900/5">
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">Assignee</label>
            <select
              value={form.assignedToId}
              onChange={(event) => setForm((current) => ({ ...current, assignedToId: event.target.value }))}
              className="min-h-[46px] w-full rounded-xl border border-[var(--border)] bg-[var(--canvas)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {assigneeOptions.map((option) => (
                <option key={option.value || 'unassigned'} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] p-4 shadow-inner shadow-slate-900/5">
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">Description</label>
            <textarea
              value={form.rawDescription}
              onChange={(event) => setForm((current) => ({ ...current, rawDescription: event.target.value }))}
              className="min-h-[110px] w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--canvas)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Describe the incident, expected behavior, and user impact."
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] p-4 shadow-inner shadow-slate-900/5">
              <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">Possible cause</label>
              <textarea
                value={form.possibleCause}
                onChange={(event) => setForm((current) => ({ ...current, possibleCause: event.target.value }))}
                className="min-h-[110px] w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--canvas)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="What is likely creating this issue?"
                required
              />
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] p-4 shadow-inner shadow-slate-900/5">
              <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">Suggested fix</label>
              <textarea
                value={form.suggestedFix}
                onChange={(event) => setForm((current) => ({ ...current, suggestedFix: event.target.value }))}
                className="min-h-[110px] w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--canvas)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Describe the remediation or workaround."
                required
              />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex shrink-0 justify-end gap-3 border-t border-[var(--border)] pt-4">
          <button type="button" onClick={onClose} className="min-h-[44px] rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-indigo-400 hover:text-indigo-400">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="min-h-[44px] rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Saving...' : mode === 'edit' ? 'Save changes' : 'Create ticket'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
