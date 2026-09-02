import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { resetPassword } from '../../../api/client';

export function ResetPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { resetToken } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!resetToken) {
      setError('This reset link is incomplete. Request a new password reset email.');
      return;
    }
    if (password.length < 8 || password !== confirmation) {
      setError(password.length < 8 ? 'Password must be at least 8 characters.' : 'Passwords do not match.');
      return;
    }
    try {
      const response = await resetPassword(resetToken, password);
      localStorage.setItem('bugcraft-token', response.token);
      setSubmitted(true);
      window.setTimeout(() => navigate('/auth', { replace: true }), 1200);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update your password.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.16),_transparent_35%),var(--canvas)] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">Security</p>
        <h2 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">Reset password</h2>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm text-[var(--text-secondary)]">New password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter a new password"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 pr-12 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-indigo-500 focus:outline-none"
            />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="relative float-right -mt-9 mr-3 text-[var(--text-muted)]">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <div>
            <label className="mb-2 block text-sm text-[var(--text-secondary)]">Confirm password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder="Repeat your new password"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-indigo-500 focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-300">{error}</p>}
          <button type="submit" className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-500">
            Update password
          </button>
        </form>

        {submitted && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
            Password updated successfully.
            <Link to="/auth" className="ml-2 font-medium text-indigo-600 underline dark:text-indigo-300">
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
