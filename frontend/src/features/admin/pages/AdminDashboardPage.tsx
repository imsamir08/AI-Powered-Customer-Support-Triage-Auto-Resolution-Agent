import { useEffect, useState } from 'react';
import { fetchAdminUsers, fetchBugAnalytics, updateAdminUserRole } from '../../../api/client';

interface AdminMember {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'DEVELOPER';
  avatar?: string;
  _count?: {
    createdBugs: number;
    assignedBugs: number;
    triageLogs: number;
  };
}

const getFriendlyMessage = (error: unknown, fallback: string): string => {
  const message = error instanceof Error ? error.message : '';
  if (message.includes('401') || message.includes('token')) return 'Your session expired. Please sign in again.';
  if (message.includes('403')) return 'Admin access is required to manage this workspace.';
  if (message.includes('Network') || message.includes('ERR_NETWORK')) return 'The server is temporarily unavailable. Please try again in a moment.';
  return fallback;
};

export function AdminDashboardPage() {
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activity, setActivity] = useState({ teamMembers: 0, activeIncidents: 0, assignedBugs: 0 });

  const loadData = async () => {
    try {
      const [users, analytics] = await Promise.all([fetchAdminUsers(), fetchBugAnalytics()]);
      const normalizedUsers = Array.isArray(users) ? users : [];
      const teamMembers = normalizedUsers.length;
      const activeIncidents = (analytics?.overview?.open ?? 0) + (analytics?.overview?.inProgress ?? 0);
      const assignedBugs = normalizedUsers.reduce((total, member) => total + (member?._count?.assignedBugs ?? 0), 0);

      setMembers(normalizedUsers);
      setActivity({ teamMembers, activeIncidents, assignedBugs });
      setError('');
    } catch (requestError) {
      setError(getFriendlyMessage(requestError, 'Unable to load workspace metrics right now.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleManageMember = async (member: AdminMember) => {
    const nextRole = member.role === 'ADMIN' ? 'DEVELOPER' : 'ADMIN';

    try {
      const response = await updateAdminUserRole(member.id, nextRole);
      if (!response?.success) {
        throw new Error(response?.message ?? 'Unable to update this team member.');
      }

      setMembers((currentMembers) =>
        currentMembers.map((current) => (current.id === member.id ? { ...current, role: nextRole } : current)),
      );
      setError('');
    } catch (requestError) {
      setError(getFriendlyMessage(requestError, 'We could not update the member role. Please try again.'));
    }
  };

  const stats = [
    { label: 'Team members', value: String(activity.teamMembers || members.length || 0) },
    { label: 'Active incidents', value: String(activity.activeIncidents || 0) },
    { label: 'Assigned bugs', value: String(activity.assignedBugs || 0) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">Workspace console</p>
        <h2 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">Admin dashboard</h2>
      </div>

      {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            <p className="text-sm text-[var(--text-secondary)]">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">{loading ? '...' : metric.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <div className="content-scroll max-h-[70vh]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--surface-alt)] text-[var(--text-secondary)]">
              <tr>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Assigned bugs</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[var(--text-secondary)]">
                    {loading ? 'Loading workspace members...' : 'No team members found in this workspace.'}
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="border-t border-[var(--border)]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-xs font-semibold text-white">
                          {member.avatar || member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{member.name}</p>
                          <p className="text-xs text-[var(--text-secondary)]">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="rounded-full bg-[var(--surface-alt)] px-2 py-1 text-xs text-[var(--text-primary)]">{member.role}</span></td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{member._count?.assignedBugs ?? 0}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleManageMember(member)}
                        className="min-h-[40px] rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] transition hover:border-indigo-500/60"
                      >
                        {member.role === 'ADMIN' ? 'Demote to Developer' : 'Promote to Admin'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
