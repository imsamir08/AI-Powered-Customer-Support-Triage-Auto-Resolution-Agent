import { BrainCircuit, CheckCircle2, LoaderCircle, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { submitTriagePrompt } from '../../../api/client';

export function AITriagePage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prompt.trim()) {
      setError('Please paste a bug report, error log, or stack trace to analyze.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await submitTriagePrompt(prompt.trim());
      setResult(response);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Unable to process this AI triage request.';
      const normalizedMessage = message.toLowerCase();

      if (normalizedMessage.includes('timeout') || normalizedMessage.includes('timed out')) {
        setError('AI triage is taking longer than expected. Please try again with a shorter log or check the Gemini service status.');
      } else if (normalizedMessage.includes('network') || normalizedMessage.includes('err_network')) {
        setError('The AI API is temporarily unavailable. Please try again in a moment.');
      } else if (normalizedMessage.includes('401') || normalizedMessage.includes('403')) {
        setError('Your session expired. Please sign in again to use AI triage.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">AI assist</p>
          <h2 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">BugCraft AI triage</h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-3 py-2 text-sm text-indigo-500">
          <Sparkles className="h-4 w-4" />
          Powered by Groq
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-indigo-500">
            <BrainCircuit className="h-3.5 w-3.5" />
            Incident intelligence
          </div>

          <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Paste a bug report or stack trace</label>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Example: Login fails with 401 after password reset, API returns invalid token..."
            className="min-h-[220px] w-full rounded-2xl border border-[var(--border)] bg-[var(--canvas)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <div className="mt-4 flex flex-wrap gap-2">
           {[
             'Analyze this error and explain the likely cause and resolution:',
             'Search existing tickets related to:',
             'Show bug metrics and status overview.',
             'Create a ticket for this error:',
           ].map((example) => (
             <button
               key={example}
               type="button"
               onClick={() => setPrompt(example)}
               className="rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-2 text-xs text-[var(--text-secondary)] transition hover:border-indigo-400 hover:text-[var(--text-primary)]"
             >
               {example}
             </button>
           ))}
          </div>

          {error && <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-65"
            >
              {loading ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analyze with AI
                </>
              )}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">What this AI does</h3>
            <ul className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" /> Categorizes the issue by area such as auth, database, UI, or API.</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" /> Determines severity and priority based on the bug description.</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" /> Suggests a possible cause and remediation path.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">AI output</h3>
            {result ? (
              <div className="content-scroll mt-4 space-y-3 pr-1 text-sm text-[var(--text-secondary)]">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Status</p>
                  <p className="mt-2 font-medium text-[var(--text-primary)]">{result.message}</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Tool used</p>
                  <p className="mt-2 font-medium text-[var(--text-primary)]">{result.result?.toolCalled ?? 'N/A'}</p>
                </div>
                {result.result?.toolCalled === 'NONE' && (
                  <p className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 text-sm text-[var(--text-secondary)]">
                    Analysis only: no ticket was created. If you want BugCraft AI to create one, submit a prompt that explicitly says “create a ticket”.
                  </p>
                )}
                {result.result?.data?.id && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400">Ticket prepared</p>
                    <p className="mt-2 font-medium text-[var(--text-primary)]">{result.result.data.title}</p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">Status: {result.result.data.status ?? 'OPEN'} · Priority: {result.result.data.priority ?? 'P2'}</p>
                  </div>
                )}
                {result.result?.data?.possibleCause && (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Likely cause</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--text-primary)]">{result.result.data.possibleCause}</p>
                  </div>
                )}
                {result.result?.data?.suggestedFix && (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Suggested resolution</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--text-primary)]">{result.result.data.suggestedFix}</p>
                  </div>
                )}
                {Array.isArray(result.result?.data?.bugs) && result.result.data.bugs.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Matching tickets</p>
                    {result.result.data.bugs.map((bug: any) => (
                      <div key={bug.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] p-3">
                        <p className="font-medium text-[var(--text-primary)]">{bug.title}</p>
                        <p className="mt-1 text-xs text-[var(--text-secondary)]">Status: {bug.status} · Severity: {bug.severity} · Priority: {bug.priority}</p>
                        {bug.possibleCause && <p className="mt-3 text-sm text-[var(--text-secondary)]"><strong className="text-[var(--text-primary)]">Cause:</strong> {bug.possibleCause}</p>}
                        {bug.suggestedFix && <p className="mt-2 text-sm text-[var(--text-secondary)]"><strong className="text-[var(--text-primary)]">Resolution:</strong> {bug.suggestedFix}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-4 text-sm text-[var(--text-secondary)]">No AI analysis has been run yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
