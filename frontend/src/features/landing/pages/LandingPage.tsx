import { ArrowRight, Bug, CheckCircle2, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  { icon: Sparkles, title: 'AI triage', text: 'Auto-ranks stack traces and recommends the next fix.' },
  { icon: Zap, title: 'Live workflows', text: 'Track incidents across backlog, in progress, review, and resolved.' },
  { icon: Bug, title: 'Secure team ops', text: 'Role-based access and workspace audit trails for production safety.' },
];

export function LandingPage() {
  return (
    <div className="landing-page min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_35%),var(--canvas)] text-[var(--text-primary)]">
      <header className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-indigo-300/40">
            <Bug className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-secondary)]">BugCraft AI</p>
          </div>
        </div>

        <div className="flex w-full max-w-[250px] flex-col gap-2 sm:w-auto sm:max-w-none sm:flex-row">
          <Link to="/auth" className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] shadow-sm transition hover:border-indigo-400 hover:bg-[var(--surface-alt)] sm:w-auto">
            Sign in
          </Link>
          <Link to="/register" className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 sm:w-auto">
            Start free
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-2 text-xs uppercase tracking-[0.2em] text-indigo-600">
              <Sparkles className="h-3.5 w-3.5" />
              AI-powered engineering ops
            </div>

            <h2 className="max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
              Fix incidents before they become outages.
            </h2>

            <p className="mt-5 max-w-xl text-base text-[var(--text-secondary)] sm:text-lg">
              BugCraft AI centralizes bug triage, workflow tracking, audit history, and team accountability in one operational cockpit.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-500">
                Create workspace <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/auth" className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-[var(--border)] px-5 py-3 text-sm text-[var(--text-secondary)] transition hover:border-indigo-500 hover:text-[var(--text-primary)]">
                View demo
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
              {['99.98% platform uptime', '4-stage queues', 'role-based access'].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_0_40px_rgba(99,102,241,0.15)]">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] p-4">
              <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                <span>Live signal</span>
                <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-300">Healthy</span>
              </div>

              <div className="space-y-4">
                {[
                  ['PG connection pool', 'CRITICAL'],
                  ['Google auth callback', 'HIGH'],
                  ['Queue worker leak', 'MEDIUM'],
                ].map(([title, level]) => (
                  <div key={title} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{title}</p>
                      <p className="text-xs text-[var(--text-muted)]">Auto-triaged • 4 mins ago</p>
                    </div>
                    <span className="rounded-full bg-indigo-500/15 px-2 py-1 text-xs text-indigo-200">{level}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14 grid gap-5 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="mb-4 inline-flex rounded-xl bg-indigo-500/15 p-3 text-indigo-600">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{text}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
