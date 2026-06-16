export default function SummaryCards({ summary }) {
  if (!summary) return null;
  const bt = summary.by_type || {};

  const cards = [
    { label: 'Poles Set Today',   value: summary.total_poles_set || 0, icon: '🏗️', color: '#22c55e',  glow: 'rgba(34,197,94,0.2)'  },
    { label: 'Delays',            value: bt.delay     || 0, icon: '🟡', color: '#eab308', glow: 'rgba(234,179,8,0.2)'  },
    { label: 'Equipment Issues',  value: bt.equipment || 0, icon: '🔧', color: '#3b82f6',  glow: 'rgba(59,130,246,0.2)' },
    { label: 'Safety Concerns',   value: bt.safety    || 0, icon: '🔴', color: '#ef4444',  glow: 'rgba(239,68,68,0.2)'  },
    { label: 'Utility / Access',  value: bt.utility   || 0, icon: '⚡', color: '#a855f7',  glow: 'rgba(168,85,247,0.2)' },
    { label: 'Partial Completions', value: bt.partial || 0, icon: '🟠', color: '#f97316', glow: 'rgba(249,115,22,0.2)' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {cards.map(c => (
        <div key={c.label} className="glass-light rounded-2xl p-4 text-center transition-transform hover:-translate-y-0.5"
          style={{ boxShadow: `0 4px 20px ${c.glow}` }}>
          <div className="text-2xl mb-2">{c.icon}</div>
          <div className="text-3xl font-bold" style={{ color: c.color }}>{c.value}</div>
          <div className="text-slate-500 text-xs mt-1 font-medium">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
