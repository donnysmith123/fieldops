import { useState, useEffect, useCallback } from 'react';
import SummaryCards from './SummaryCards';
import FiltersBar from './FiltersBar';
import LogCard from './LogCard';
import ReportSection from './ReportSection';
import MapView from './MapView';

const DEFAULT_FILTERS = {
  start: new Date().toISOString().split('T')[0],
  end:   new Date().toISOString().split('T')[0],
  crew_name: '', job_number: '', entry_type: '', pole_size: '',
};

export default function AdminDashboard() {
  const [logs, setLogs]       = useState([]);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [view, setView]       = useState('list'); // 'list' | 'map'

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    const res = await fetch(`/api/logs?${params}`);
    setLogs(await res.json());
    setLoading(false);
  }, [filters]);

  const fetchSummary = useCallback(async () => {
    const day = filters.start || new Date().toISOString().split('T')[0];
    const res = await fetch(`/api/summary?date=${day}`);
    setSummary(await res.json());
  }, [filters.start]);

  useEffect(() => { fetchLogs(); fetchSummary(); }, [fetchLogs, fetchSummary]);

  const handleUpdate = async (id, patch) => {
    const res = await fetch(`/api/logs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    const updated = await res.json();
    setLogs(prev => prev.map(l => l.id === id ? updated : l));
  };

  const handleDelete = async id => {
    await fetch(`/api/logs/${id}`, { method: 'DELETE' });
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  return (
    <div className="admin-bg min-h-screen">
      {/* Decorative orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 right-20 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
        <div className="absolute bottom-20 -left-20 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)' }} />
      </div>

      {/* Top nav */}
      <div className="sticky top-0 z-50 glass-light border-b border-white/60 px-6 py-3.5 flex items-center justify-between"
        style={{ backdropFilter: 'blur(24px)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}>
            🏗️
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">FieldOps Admin</h1>
            <p className="text-slate-400 text-xs">Pole Distribution Operations Dashboard</p>
          </div>
        </div>
        <div className="flex gap-2">
          <a href="/field"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
            📱 Field App
          </a>
          <button onClick={() => { fetchLogs(); fetchSummary(); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 transition-colors"
            style={{ background: 'rgba(100,116,139,0.08)', border: '1px solid rgba(100,116,139,0.2)' }}>
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-6">
        <SummaryCards summary={summary} />
        <FiltersBar filters={filters} onChange={setFilters} onReset={() => setFilters(DEFAULT_FILTERS)} />
        <ReportSection logs={logs} summary={summary} />

        {/* View toggle + log feed header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-700">
            Log Entries{' '}
            {!loading && <span className="font-normal text-slate-400 text-sm">({logs.length})</span>}
            {loading && (
              <span className="ml-3 inline-flex items-center gap-1.5 text-sm font-normal text-slate-400">
                <span className="inline-block w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                Loading...
              </span>
            )}
          </h2>

          {/* Map / List toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl"
            style={{ background: 'rgba(100,116,139,0.08)', border: '1px solid rgba(100,116,139,0.15)' }}>
            {[
              { id: 'list', label: '☰ List' },
              { id: 'map',  label: '🗺️ Map'  },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                style={view === tab.id
                  ? { background: 'white', color: '#4f46e5', boxShadow: '0 1px 6px rgba(0,0,0,0.1)' }
                  : { color: '#94a3b8' }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Map view */}
        {view === 'map' && <MapView logs={logs} />}

        {/* List view */}
        {view === 'list' && (
          <>
            {!loading && logs.length === 0 && (
              <div className="glass-light rounded-2xl text-center py-16 text-slate-400">
                <div className="text-4xl mb-3">📋</div>
                <p className="font-medium">No log entries found for the selected filters.</p>
                <p className="text-sm mt-1">Try widening the date range or clearing filters.</p>
              </div>
            )}
            <div className="space-y-4">
              {logs.map(log => (
                <LogCard key={log.id} log={log} onUpdate={handleUpdate} onDelete={handleDelete} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
