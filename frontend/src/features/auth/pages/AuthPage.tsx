import { Code2, Eye, EyeOff, Mail, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCurrentUser, forgotPassword, loginUser } from '../../../api/client';
import { useAuth } from '../../../context/AuthContext';

const getFriendlyMessage = (error: unknown, fallback: string): string => {
  const message = error instanceof Error ? error.message : '';

  if (!message) {
    return fallback;
  }

  if (message.includes('401') || message.includes('Invalid email or password')) {
    return 'We could not sign you in with those credentials. Please check your email and password, or use the demo account.';
  }

  if (message.includes('Network') || message.includes('ERR_NETWORK')) {
    return 'The server is currently unavailable. Please try again in a moment.';
  }

  if (message.includes('429')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }

  return fallback;
};

export function AuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('alex@bugcraft.ai');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotForm, setShowForgotForm] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get('oauthToken');
    const oauthError = params.get('oauthError');

    if (oauthError) {
      setError(decodeURIComponent(oauthError));
      return;
    }

    if (!oauthToken) return;

    const completeOAuthLogin = async () => {
      try {
        localStorage.setItem('bugcraft-token', oauthToken);
        const response = await fetchCurrentUser();
        const currentUser = response?.user ?? response?.data ?? response;
        if (!currentUser?.id) throw new Error('OAuth login returned an invalid user.');
        login(currentUser);
        navigate('/dashboard', { replace: true });
      } catch {
        localStorage.removeItem('bugcraft-token');
        setError('Social login could not be completed. Check the provider configuration and try again.');
      }
    };

    void completeOAuthLogin();
  }, [login, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await loginUser({ email, password });
      const token = response?.token;
      const user = response?.user;

      if (!token || !user) {
        throw new Error('Login response was invalid.');
      }

      localStorage.setItem('bugcraft-token', token);
      login(user);
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      const message = getFriendlyMessage(requestError, 'Unable to sign in right now. Please try again.');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setForgotMessage('');

    try {
      const response = await forgotPassword(forgotEmail.trim());
      setForgotMessage(response?.message ?? 'If the email exists, a reset link has been sent.');
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Unable to send the reset email.';
      setError(message.includes('404') ? 'No account was found with that email address.' : 'Unable to send the reset email. Check your email configuration and try again.');
    }
  };

  const startSocialLogin = (provider: 'google' | 'github') => {
    const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000').replace(/\/+$/, '');
    window.location.assign(`${apiBaseUrl}/api/auth/${provider}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.16),_transparent_35%),var(--canvas)] px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)]/80 shadow-[0_0_40px_rgba(99,102,241,0.18)] md:grid-cols-2">
        <div className="hidden bg-[var(--surface-alt)] p-8 md:flex md:flex-col md:justify-between">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-indigo-700 dark:text-indigo-200">
              <Sparkles className="h-3.5 w-3.5" />
              BugCraft AI
            </div>
            <h1 className="text-4xl font-semibold text-[var(--text-primary)]">Ship faster with autonomous incident triage.</h1>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--text-secondary)]">
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Observability</p>
            <p>Auto-detects stack traces, ranks severity, and suggests the safest next fix path.</p>
          </div>
        </div>

        <div className="p-6 md:p-10">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">Welcome back</p>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">Sign in</h2>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm text-[var(--text-secondary)]">Email</label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="team@bugcraft.ai"
                className="min-h-[44px] w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-[var(--text-secondary)]">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="min-h-[44px] w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 pr-12 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-indigo-500 focus:outline-none"
              />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="relative float-right -mt-9 mr-3 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                 {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {error && <p className="text-sm text-red-300">{error}</p>}
            <button type="submit" disabled={loading} className="min-h-[48px] w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-60">
              {loading ? 'Signing in...' : 'Continue to dashboard'}
            </button>
          </form>

          <button type="button" onClick={() => setShowForgotForm((visible) => !visible)} className="mt-3 block w-full text-center text-sm text-indigo-600 underline dark:text-indigo-300">
            {showForgotForm ? 'Back to sign in' : 'Forgot password?'}
          </button>

          {showForgotForm && (
            <form className="mt-4 space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] p-4" onSubmit={handleForgotPassword}>
              <label className="block text-sm text-[var(--text-secondary)]">Account email</label>
              <input type="email" value={forgotEmail} onChange={(event) => setForgotEmail(event.target.value)} required placeholder="you@example.com" className="min-h-[44px] w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-primary)]" />
              <button type="submit" className="min-h-[44px] w-full rounded-xl border border-indigo-500/50 px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-500/10 dark:text-indigo-200">Send reset link</button>
              {forgotMessage && <p className="text-sm text-emerald-300">{forgotMessage}</p>}
            </form>
          )}

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
            <span className="h-px flex-1 bg-[var(--border)]" />
            or
            <span className="h-px flex-1 bg-[var(--border)]" />
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => startSocialLogin('google')}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-primary)] transition hover:border-indigo-400"
            >
              <Mail className="h-4 w-4" />
              Continue with Google
            </button>
            <button
              type="button"
              onClick={() => startSocialLogin('github')}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-primary)] transition hover:border-indigo-400"
            >
              <Code2 className="h-4 w-4" />
              Continue with GitHub
            </button>
          </div>

          <div className="mt-5 text-center text-sm text-[var(--text-secondary)]">
            Need an account?{' '}
            <Link to="/register" className="font-medium text-indigo-600 underline dark:text-indigo-300">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
