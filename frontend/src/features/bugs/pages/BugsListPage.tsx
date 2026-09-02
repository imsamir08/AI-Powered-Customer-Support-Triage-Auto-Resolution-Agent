import { PencilLine, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { deleteBug, fetchAdminUsers, fetchBugs, updateBug } from '../../../api/client';
import { BugFormModal } from '../../../components/common/BugFormModal';
import { useAuth } from '../../../context/AuthContext';
import type { BugItem, User } from '../../../types';

const defaultBugs: BugItem[] = [];
const BUG_STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const BUG_SEVERITY_OPTIONS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const BUG_PRIORITY_OPTIONS = ['P0', 'P1', 'P2', 'P3'];

export function BugsListPage() {
  const { user } = useAuth();
  const [bugs, setBugs] = useState<BugItem[]>(defaultBugs);
  const [assigneeList, setAssigneeList] = useState<User[]>([]);
  const [query, setQuery] = useState('');
  const [modalState, setModalState] = useState<{ mode: 'create' | 'edit'; bug?: BugItem } | null>(null);
  const [error, setError] = useState('');

  const loadBugs = async () => {
    try {
      const response = await fetchBugs({ page: 1, limit: 50 });
      setBugs(Array.isArray(response) ? response : []);
      setError('');
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Unable to load tickets.';
      setError(message.includes('Network') || message.includes('ERR_NETWORK') ? 'Network error: backend may be offline.' : message);
      setBugs([]);
    }
  };

  useEffect(() => {
    void loadBugs();
  }, []);

  useEffect(() => {
    const loadAssignees = async () => {
      try {
        const members = await fetchAdminUsers();
        setAssigneeList(Array.isArray(members) ? members : []);
      } catch {
        setAssigneeList([]);
      }
    };

    void loadAssignees();
  }, []);

  const filteredBugs = useMemo(() => {
    const value = query.trim().toLowerCase();

    if (!value) {
      return bugs;
    }

    return bugs.filter((bug) =>
      [bug.title ?? '', bug.status ?? '', bug.severity ?? '', bug.category ?? '', bug.assignee ?? '', bug.id ?? ''].some((field) =>
        field.toLowerCase().includes(value),
      ),
    );
  }, [bugs, query]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this bug ticket?')) {
      return;
    }

    try {
      await deleteBug(id);
      await loadBugs();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Deletion failed.';
      setError(message.includes('Network') || message.includes('ERR_NETWORK') ? 'Network error: backend may be offline.' : message);
    }
  };

  const handleInlineUpdate = async (bug: BugItem, field: 'status' | 'severity' | 'priority' | 'assignedToId', value: string) => {
    try {
      const payload: Record<string, string | null> = {};

      if (field === 'assignedToId') {
        payload.assignedToId = value || null;
      } else {
        payload[field] = value || '';
      }

      await updateBug(bug.id, payload);
      await loadBugs();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Update failed.';
      setError(message.includes('Network') || message.includes('ERR_NETWORK') ? 'Network error: server is unreachable.' : message);
    }
  };

  const assigneeOptions = useMemo(() => {
    const uniqueValues = new Map<string, string>();

    assigneeList.forEach((member) => {
      if (member.id) {
        uniqueValues.set(member.id, member.name || member.email || 'Team member');
      }
    });

    if (user?.id && !uniqueValues.has(user.id)) {
      uniqueValues.set(user.id, user.name || 'Current user');
    }

    return [
      { value: '', label: 'Unassigned' },
      ...Array.from(uniqueValues.entries()).map(([value, label]) => ({ value, label })),
    ];
  }, [assigneeList, user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">Directory</p>
          <h2 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">Bug directory</h2>
        </div>

        <div className="flex w-full flex-col gap-3 md:max-w-xl md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, keyword, or ID"
              className="min-h-[44px] w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] shadow-sm"
            />
          </div>

          <button
            type="button"
            onClick={() => setModalState({ mode: 'create' })}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            New ticket
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <div className="content-scroll max-h-[70vh]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--surface-alt)] text-[var(--text-secondary)]">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Assignee</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBugs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[var(--text-secondary)]">
                    No bug tickets match your current filter.
                  </td>
                </tr>
              ) : (
                filteredBugs.map((bug, index) => (
                  <tr key={bug.id} className="border-t border-[var(--border)] align-top transition hover:bg-[var(--surface-alt)]/70">
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{index + 1}</td>
                    <td className="px-4 py-3 text-[var(--text-primary)]">{bug.title}</td>
                    <td className="px-4 py-3">
                      <select
                        value={bug.status ?? 'OPEN'}
                        onChange={(event) => void handleInlineUpdate(bug, 'status', event.target.value)}
                        className="min-h-[36px] rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] px-2 py-1 text-xs text-[var(--text-primary)] outline-none ring-0 transition hover:border-indigo-400"
                      >
                        {BUG_STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={bug.severity ?? 'MEDIUM'}
                        onChange={(event) => void handleInlineUpdate(bug, 'severity', event.target.value)}
                        className="min-h-[36px] rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] px-2 py-1 text-xs text-[var(--text-primary)] outline-none ring-0 transition hover:border-indigo-400"
                      >
                        {BUG_SEVERITY_OPTIONS.map((severity) => (
                          <option key={severity} value={severity}>{severity}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={bug.priority ?? 'P2'}
                        onChange={(event) => void handleInlineUpdate(bug, 'priority', event.target.value)}
                        className="min-h-[36px] rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] px-2 py-1 text-xs text-[var(--text-primary)] outline-none ring-0 transition hover:border-indigo-400"
                      >
                        {BUG_PRIORITY_OPTIONS.map((priority) => (
                          <option key={priority} value={priority}>{priority}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{bug.category ?? 'GENERAL'}</td>
                    <td className="px-4 py-3">
                      <select
                        value={bug.assignedToId ?? bug.assigneeId ?? ''}
                        onChange={(event) => void handleInlineUpdate(bug, 'assignedToId', event.target.value)}
                        className="min-h-[36px] rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] px-2 py-1 text-xs text-[var(--text-primary)] outline-none ring-0 transition hover:border-indigo-400"
                      >
                        {assigneeOptions.map((option) => (
                          <option key={option.value || 'unassigned'} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setModalState({ mode: 'edit', bug })}
                          className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] transition hover:border-indigo-400 hover:text-indigo-400"
                        >
                          <PencilLine className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(bug.id)}
                          className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-red-500/40 bg-red-500/10 px-2.5 py-1.5 text-xs text-red-400 transition hover:bg-red-500/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalState && (
        <BugFormModal
          isOpen={Boolean(modalState)}
          mode={modalState.mode}
          initialBug={modalState.bug}
          onClose={() => setModalState(null)}
          onSaved={async () => {
            setModalState(null);
            await loadBugs();
          }}
        />
      )}
    </div>
  );
}
