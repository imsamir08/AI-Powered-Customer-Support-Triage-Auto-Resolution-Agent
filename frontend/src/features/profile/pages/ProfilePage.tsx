import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

export function ProfilePage() {
  const { user, login, logout } = useAuth();
  const [name, setName] = useState(user?.name ?? 'Alex Dev');
  const [email, setEmail] = useState(user?.email ?? 'alex@bugcraft.ai');
  const [message, setMessage] = useState('');

  const handleSave = () => {
    if (!user) {
      return;
    }

    login({ ...user, name, email });
    setMessage('Profile updated successfully.');
  };

  const handlePasswordUpdate = () => {
    setMessage('Security settings saved.');
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">Account</p>
        <h2 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">Profile settings</h2>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Account details</h3>
          <div className="mt-5 space-y-4">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-indigo-500"
            />
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-indigo-500"
            />
            <div className="flex gap-3">
              <button type="button" onClick={handleSave} className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-110">
                Save changes
              </button>
              <button type="button" onClick={logout} className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)]">
                Sign out
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Security</h3>
          <div className="mt-5 space-y-4">
            <input type="password" placeholder="Current password" className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-indigo-500" />
            <input type="password" placeholder="New password" className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-indigo-500" />
            <button type="button" onClick={handlePasswordUpdate} className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)]">
              Update password
            </button>
          </div>
        </div>
      </div>

      {message && <p className="text-sm text-emerald-400">{message}</p>}
    </div>
  );
}
