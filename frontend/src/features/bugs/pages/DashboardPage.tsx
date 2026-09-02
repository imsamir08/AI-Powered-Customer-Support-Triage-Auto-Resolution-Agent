import { AlertTriangle, Bot, CheckCircle2, Gauge, Sparkles, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchBugAnalytics } from '../../../api/client';

interface AnalyticsOverview {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  critical: number;
  resolutionRate: number;
}

interface AnalyticsResponse {
  overview: AnalyticsOverview;
  byCategory: Array<{ category: string; count: number }>;
  bySeverity: Array<{ severity: string; count: number }>;
  byPriority: Array<{ priority: string; count: number }>;
  recentActivity: Array<{ id: string; title: string; category: string; severity: string; status: string; createdAt: string; createdBy?: { name?: string } }>;
}

const defaultAnalytics: AnalyticsResponse = {
  overview: {
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    critical: 0,
    resolutionRate: 0,
  },
  byCategory: [],
  bySeverity: [],
  byPriority: [],
  recentActivity: [],
};

export function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse>(defaultAnalytics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await fetchBugAnalytics();
        setAnalytics(data ?? defaultAnalytics);
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : 'Unable to load analytics.';
        setError(message.includes('Network') || message.includes('ERR_NETWORK') ? 'Network error: backend is unavailable.' : message);
      } finally {
        setLoading(false);
      }
    };

    void loadAnalytics();
  }, []);

  const metrics = [
    { label: 'Open incidents', value: String(analytics.overview.open ?? 0), delta: `${analytics.overview.resolutionRate ?? 0}% resolved`, tone: 'text-amber-300' },
    { label: 'Resolved today', value: String(analytics.overview.resolved ?? 0), delta: `${analytics.overview.closed ?? 0} closed`, tone: 'text-emerald-300' },
    { label: 'Critical queue', value: String(analytics.overview.critical ?? 0), delta: `${analytics.overview.inProgress ?? 0} in progress`, tone: 'text-rose-300' },
    { label: 'Total tickets', value: String(analytics.overview.total ?? 0), delta: `${analytics.overview.resolutionRate ?? 0}% resolution rate`, tone: 'text-violet-300' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">Operations view</p>
          <h2 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">BugCraft AI dashboard</h2>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-500">
          {loading ? 'Loading metrics...' : 'Live status OK'}
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-[var(--text-secondary)]">{metric.label}</p>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] p-2 text-[var(--text-primary)]">
                {metric.label.includes('Resolved') ? <CheckCircle2 className="h-4 w-4" /> : metric.label.includes('Critical') ? <AlertTriangle className="h-4 w-4" /> : metric.label.includes('Total') ? <TrendingUp className="h-4 w-4" /> : <Gauge className="h-4 w-4" />}
              </div>
            </div>
            <div className="text-3xl font-semibold text-[var(--text-primary)]">{metric.value}</div>
            <div className={`mt-2 text-sm ${metric.tone}`}>{metric.delta}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 p-5 shadow-[0_12px_30px_rgba(99,102,241,0.08)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-indigo-500/15 p-2 text-indigo-500">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">AI intelligence</p>
              <h3 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">Gemini-powered bug triage is active</h3>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-500">
            <Sparkles className="h-4 w-4" />
            Live analysis
          </div>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
          BugCraft uses Google Gemini to detect issue category, severity, priority, and suggested remediation from stack traces, logs, and bug reports before tickets reach the workflow board.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Severity split</h3>
          <div className="mt-5 space-y-4">
            {analytics.bySeverity.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">No severity data available yet.</p>
            ) : (
              analytics.bySeverity.map((item) => (
                <div key={item.severity}>
                  <div className="mb-1 flex items-center justify-between text-sm text-[var(--text-secondary)]">
                    <span>{item.severity}</span>
                    <span>{item.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--surface-alt)]">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                      style={{ width: `${(item.count / Math.max(analytics.overview.total || 1, 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Recent activity</h3>
          <div className="mt-5 space-y-3 text-sm text-[var(--text-secondary)]">
            {analytics.recentActivity.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">No recent activity yet.</p>
            ) : (
              analytics.recentActivity.map((item) => (
                <div key={item.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-[var(--text-primary)]">{item.title}</span>
                    <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-indigo-500">
                      {item.severity}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-[var(--text-secondary)]">
                    {item.category} • {item.status} • {item.createdBy?.name ?? 'Unknown'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
