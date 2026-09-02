import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../../api/client';
import { useAuth } from '../../../context/AuthContext';

const getFriendlyMessage = (error: unknown, fallback: string): string => {
  const message = error instanceof Error ? error.message : '';

  if (!message) {
    return fallback;
  }

  if (message.includes('already registered') || message.includes('Email')) {
    return 'This email is already in use. Please sign in or use a different email address.';
  }

  if (message.includes('Network') || message.includes('ERR_NETWORK')) {
    return 'The server is currently unavailable. Please try again in a moment.';
  }

  if (message.includes('400') || message.includes('Please provide')) {
    return 'Please complete all fields before creating your workspace.';
  }

  return fallback;
};

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await registerUser(form);
      const token = response?.token;
      const user = response?.user;

      if (!token || !user) {
        throw new Error('Registration response was invalid.');
      }

      localStorage.setItem('bugcraft-token', token);
      login(user);
      navigate('/dashboard');
    } catch (requestError) {
      setError(getFriendlyMessage(requestError, 'We could not create your workspace right now. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.16),_transparent_35%),var(--canvas)] px-4 py-10">
      <div className="w-full max-w-md rounded-[28px] border border-[var(--border)] bg-[var(--surface)]/80 p-6 shadow-[0_0_40px_rgba(99,102,241,0.18)] md:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">Create account</p>
        <h2 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">Register</h2>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm text-[var(--text-secondary)]">Full name</label>
            <input
              value={form.name}
              autoComplete="name"
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Alex Dev"
              className="min-h-[44px] w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-[var(--text-secondary)]">Email</label>
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="team@bugcraft.ai"
              className="min-h-[44px] w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-[var(--text-secondary)]">Password</label>
            <input
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="Create a strong password"
              className="min-h-[44px] w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}

          <button type="submit" disabled={loading} className="min-h-[48px] w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-60">
            {loading ? 'Creating account...' : 'Create workspace'}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-[var(--text-secondary)]">
          Already have an account?{' '}
          <Link to="/auth" className="font-medium text-indigo-600 underline dark:text-indigo-300">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
