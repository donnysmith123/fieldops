import { downloadCSV } from './utils';

export default function ReportSection({ logs, summary }) {
  if (!logs.length && !summary) return null;

  const byCrew = {};
  for (const log of logs) {
    const key = log.crew_name || 'Unknown Crew';
    if (!byCrew[key]) byCrew[key] = { poles: 0, delays: [], issues: [] };
    if (log.entry_type === 'completed' || log.entry_type === 'partial')
      byCrew[key].poles += log.poles_set_count || 0;
    if (log.entry_type === 'delay')
      byCrew[key].delays.push(...(log.chips_selected || []));
    if (['equipment', 'utility', 'safety'].includes(log.entry_type))
      byCrew[key].issues.push(log.entry_type);
  }

  return (
    <div className="glass-light rounded-2xl p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-700">📊 Production Summary</h2>
        <button onClick={() => downloadCSV(logs)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#16a34a,#065f46)', boxShadow: '0 4px 14px rgba(22,163,74,0.35)' }}>
          ⬇️ Export CSV
        </button>
      </div>
      <div className="space-y-2">
        {Object.entries(byCrew).map(([crew, data]) => (
          <div key={crew} className="text-sm text-slate-600 rounded-xl px-4 py-3"
            style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.1)' }}>
            <strong className="text-slate-700">{crew}</strong> set <strong>{data.poles}</strong> pole{data.poles !== 1 ? 's' : ''}.
            {data.delays.length > 0 && <span> Delays: {[...new Set(data.delays)].join(', ')}.</span>}
            {data.issues.length > 0 && <span> Issues: {[...new Set(data.issues)].join(', ')}.</span>}
          </div>
        ))}
        {Object.keys(byCrew).length === 0 && (
          <p className="text-slate-400 text-sm">No entries in current filter range.</p>
        )}
      </div>
    </div>
  );
}
