import { ArrowRight, CirclePlus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { fetchBugs, updateBug } from '../../../api/client';
import { BugFormModal } from '../../../components/common/BugFormModal';
import type { BugItem } from '../../../types';

const STATUS_COLUMNS = [
  { title: 'Backlog', key: 'OPEN', tone: 'border-slate-700' },
  { title: 'In progress', key: 'IN_PROGRESS', tone: 'border-cyan-500/40' },
  { title: 'Resolved', key: 'RESOLVED', tone: 'border-emerald-500/40' },
  { title: 'Closed', key: 'CLOSED', tone: 'border-violet-500/40' },
] as const;

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;

export function KanbanPage() {
  const [bugs, setBugs] = useState<BugItem[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [draggedTicketId, setDraggedTicketId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadBugs = async () => {
    try {
      const response = await fetchBugs({ page: 1, limit: 100 });
      setBugs(Array.isArray(response) ? response : []);
      setError('');
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Unable to load kanban tickets.';
      setError(message.includes('Network') || message.includes('ERR_NETWORK') ? 'Network error: backend may be offline.' : message);
      setBugs([]);
    }
  };

  useEffect(() => {
    void loadBugs();
  }, []);

  const columns = useMemo(
    () =>
      STATUS_COLUMNS.map((column) => ({
        ...column,
        tickets: bugs.filter((bug) => (bug.status ?? 'OPEN') === column.key),
      })),
    [bugs],
  );

  const moveTicket = async (ticketId: string, nextStatus: string) => {
    try {
      await updateBug(ticketId, { status: nextStatus });
      await loadBugs();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Failed to update ticket.';
      setError(message.includes('Network') || message.includes('ERR_NETWORK') ? 'Network error: server is unreachable.' : message);
    }
  };

  const handleAdvanceSelection = async () => {
    const nextTicket = bugs.find((bug) => (bug.status ?? 'OPEN') === 'OPEN');

    if (!nextTicket) {
      return;
    }

    await moveTicket(nextTicket.id, 'IN_PROGRESS');
  };

  const handleDrop = async (status: string) => {
    if (!draggedTicketId) {
      return;
    }

    await moveTicket(draggedTicketId, status);
    setDraggedTicketId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">Workflow board</p>
          <h2 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">Incident kanban</h2>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setIsCreateOpen(true)} className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] transition hover:border-indigo-400">
            <CirclePlus className="h-4 w-4" />
            New ticket
          </button>
          <button type="button" onClick={() => void handleAdvanceSelection()} className="flex min-h-[44px] items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-3 py-2 text-sm font-medium text-indigo-500 transition hover:bg-indigo-500/15">
            Advance selection <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid gap-4 xl:grid-cols-4">
        {columns.map((column) => (
          <div
            key={column.title}
            className={`flex min-h-[420px] flex-col rounded-2xl border bg-[var(--surface)] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] ${column.tone}`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => void handleDrop(column.key)}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">{column.title}</h3>
              <span className="rounded-full bg-[var(--surface-alt)] px-2 py-1 text-xs text-[var(--text-secondary)]">{column.tickets.length}</span>
            </div>
            <div className="content-scroll max-h-[70vh] flex-1 space-y-3 pr-1">
              {column.tickets.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-alt)] px-3 py-6 text-center text-xs text-[var(--text-muted)]">
                  Drop here
                </div>
              ) : (
                column.tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    draggable
                    onDragStart={() => setDraggedTicketId(ticket.id)}
                    onDragEnd={() => setDraggedTicketId(null)}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] p-3 text-sm text-[var(--text-primary)] shadow-sm"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-indigo-500/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-indigo-500">
                        #{String(column.tickets.findIndex((item) => item.id === ticket.id) + 1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">{ticket.priority ?? 'P2'}</span>
                    </div>
                    <p className="font-medium">{ticket.title}</p>
                    <p className="mt-2 text-xs text-[var(--text-secondary)]">{ticket.category ?? 'GENERAL'}</p>
                    <label className="mt-3 block">
                      <span className="sr-only">Move ticket status</span>
                      <select
                        value={ticket.status ?? 'OPEN'}
                        onChange={(event) => void moveTicket(ticket.id, event.target.value)}
                        className="min-h-[34px] w-full rounded-lg border border-[var(--border)] bg-[var(--canvas)] px-2 py-1.5 text-[11px] text-[var(--text-primary)] outline-none ring-0 transition hover:border-indigo-400"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>{status.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <BugFormModal
        isOpen={isCreateOpen}
        mode="create"
        onClose={() => setIsCreateOpen(false)}
        onSaved={async () => {
          setIsCreateOpen(false);
          await loadBugs();
        }}
      />
    </div>
  );
}
