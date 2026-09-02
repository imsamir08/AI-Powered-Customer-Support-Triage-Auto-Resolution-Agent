const entries = [
  { actor: 'Gemini Triage', operation: 'CREATE_BUG', endpoint: '/api/triage/prompt', status: 'SUCCESS' },
  { actor: 'Alex Dev', operation: 'UPDATE_BUG', endpoint: '/api/bugs/1042', status: 'SUCCESS' },
  { actor: 'Rae Gomez', operation: 'SEARCH_BUGS', endpoint: '/api/bugs?keyword=auth', status: 'WARN' },
  { actor: 'Admin Console', operation: 'GET_BUG_STATS', endpoint: '/api/bugs/analytics/overview', status: 'SUCCESS' },
];

export function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Compliance</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Audit logs</h2>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/80">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-950/70 text-slate-300">
            <tr>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Operation</th>
              <th className="px-4 py-3">Endpoint</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={`${entry.actor}-${entry.operation}`} className="border-t border-slate-700/80">
                <td className="px-4 py-3 text-white">{entry.actor}</td>
                <td className="px-4 py-3 text-slate-300">{entry.operation}</td>
                <td className="px-4 py-3 text-slate-400">{entry.endpoint}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs ${entry.status === 'WARN' ? 'bg-amber-500/15 text-amber-200' : 'bg-emerald-500/15 text-emerald-200'}`}>
                    {entry.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
