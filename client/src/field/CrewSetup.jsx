import { useState } from 'react';

const FIELDS = [
  { key: 'crew_name',   label: 'Crew Name / Foreman Name', placeholder: 'e.g. John Smith' },
  { key: 'crew_number', label: 'Crew Number',               placeholder: 'e.g. CR-07' },
  { key: 'truck_id',    label: 'Truck ID',                  placeholder: 'e.g. T-142' },
  { key: 'job_number',  label: 'Job Number / Work Order',   placeholder: 'e.g. JOB-2024-001' },
];

export default function CrewSetup({ onSave }) {
  const saved = JSON.parse(localStorage.getItem('fieldops_crew') || '{}');
  const [form, setForm] = useState({
    crew_name:   saved.crew_name   || '',
    crew_number: saved.crew_number || '',
    truck_id:    saved.truck_id    || '',
    job_number:  saved.job_number  || '',
  });

  const handleSave = () => {
    localStorage.setItem('fieldops_crew', JSON.stringify(form));
    onSave(form);
  };

  return (
    <div className="field-bg min-h-dvh flex flex-col items-center justify-center p-6">
      {/* Decorative orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl glass mb-4"
            style={{ background: 'rgba(99,102,241,0.3)' }}>
            <span className="text-4xl">🏗️</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Crew Setup</h1>
          <p className="text-white/50 mt-1 text-sm">Enter your details to begin logging</p>
        </div>

        <div className="glass rounded-3xl p-6 space-y-4">
          {FIELDS.map(f => (
            <div key={f.key}>
              <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-1.5">
                {f.label}
              </label>
              <input
                className="glass-input w-full rounded-xl px-4 py-3.5 text-base"
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              />
            </div>
          ))}

          <button
            onClick={handleSave}
            className="w-full mt-2 py-4 rounded-2xl font-bold text-base text-white transition-all active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              boxShadow: '0 0 30px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            Start Logging →
          </button>
        </div>

        <p className="text-white/25 text-xs text-center mt-6">FieldOps · Pole Distribution Logger</p>
      </div>
    </div>
  );
}
