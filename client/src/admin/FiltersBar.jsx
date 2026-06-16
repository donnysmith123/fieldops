export default function FiltersBar({ filters, onChange, onReset }) {
  const set = key => e => onChange({ ...filters, [key]: e.target.value });

  const inputCls = 'glass-light rounded-xl px-3 py-2 text-sm text-slate-700 border-0 focus:outline-none focus:ring-2 focus:ring-indigo-300 w-full';

  return (
    <div className="glass-light rounded-2xl p-5 mb-5">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1 min-w-[130px]">
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide">From Date</label>
          <input type="date" className={inputCls} value={filters.start} onChange={set('start')} />
        </div>
        <div className="flex flex-col gap-1 min-w-[130px]">
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide">To Date</label>
          <input type="date" className={inputCls} value={filters.end} onChange={set('end')} />
        </div>
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Crew Name</label>
          <input className={inputCls} placeholder="Search..." value={filters.crew_name} onChange={set('crew_name')} />
        </div>
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Job Number</label>
          <input className={inputCls} placeholder="Search..." value={filters.job_number} onChange={set('job_number')} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Entry Type</label>
          <select className={inputCls} value={filters.entry_type} onChange={set('entry_type')}>
            <option value="">All Types</option>
            <option value="delay">Delay</option>
            <option value="completed">Completed</option>
            <option value="partial">Partial</option>
            <option value="equipment">Equipment</option>
            <option value="utility">Utility</option>
            <option value="safety">Safety</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Pole Size</label>
          <select className={inputCls} value={filters.pole_size} onChange={set('pole_size')}>
            <option value="">Any Size</option>
            {['30ft','35ft','40ft','45ft','50ft','55ft','60ft'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={onReset}
          className="self-end px-4 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
          style={{ background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.2)' }}>
          ↺ Reset
        </button>
      </div>
    </div>
  );
}
