import { useState } from 'react';
import { TYPE_META, fmtTime } from './utils';
import HeatIndexBadge from '../shared/HeatIndexBadge';

export default function LogCard({ log, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [editNote, setEditNote]       = useState(log.note || '');
  const [editChips, setEditChips]     = useState([...(log.chips_selected || [])]);
  const [editCount, setEditCount]     = useState(log.poles_set_count || '');
  const [editSize, setEditSize]       = useState(log.pole_size || '');
  const [editClass, setEditClass]     = useState(log.pole_class || '');
  const [editSpecies, setEditSpecies] = useState(log.pole_species || '');
  const [editMethod, setEditMethod]   = useState(log.setting_method || '');
  const [deleting, setDeleting]       = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  const meta    = TYPE_META[log.entry_type] || TYPE_META.delay;
  const isPoles = log.entry_type === 'completed' || log.entry_type === 'partial';
  const mapsUrl = log.lat && log.lng ? `https://maps.google.com/?q=${log.lat},${log.lng}` : null;

  const handleSave = async () => {
    await onUpdate(log.id, {
      note: editNote, chips_selected: editChips,
      poles_set_count: editCount ? parseInt(editCount) : null,
      pole_size: editSize, pole_class: editClass,
      pole_species: editSpecies, setting_method: editMethod,
    });
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this log entry?')) return;
    setDeleting(true);
    await onDelete(log.id);
  };

  return (
    <div className="glass-light rounded-2xl overflow-hidden transition-transform hover:-translate-y-0.5"
      style={{ boxShadow: `0 4px 24px ${meta.color}18` }}>

      {/* Color bar header */}
      <div className="flex items-center gap-3 px-5 py-3"
        style={{ background: `linear-gradient(135deg, ${meta.color}22, ${meta.color}0a)`, borderBottom: `1px solid ${meta.color}33` }}>
        <span className="text-xl">{meta.icon}</span>
        <span className="font-bold text-sm flex-1" style={{ color: meta.color }}>{meta.label}</span>
        {log.lightning_risk && <span className="text-yellow-500 text-xs font-semibold">⚡ Lightning Risk</span>}
      </div>

      <div className="p-5 space-y-3">
        {/* Crew info */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
          {log.crew_name   && <span className="font-semibold text-slate-700">👷 {log.crew_name}</span>}
          {log.truck_id    && <span>🚛 {log.truck_id}</span>}
          {log.job_number  && <span>📋 Job #{log.job_number}</span>}
          {log.crew_number && <span className="text-slate-400">#{log.crew_number}</span>}
        </div>

        {/* Timestamp + location */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
          <span>🕐 {fmtTime(log.timestamp)}</span>
          {mapsUrl
            ? <a href={mapsUrl} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: meta.color }}>
                📍 {log.address || `${log.lat?.toFixed(4)}, ${log.lng?.toFixed(4)}`}
              </a>
            : log.address && <span>📍 {log.address}</span>
          }
        </div>

        {/* Chips */}
        {log.chips_selected?.length > 0 && !editing && (
          <div className="flex flex-wrap gap-1.5">
            {log.chips_selected.map(c => (
              <span key={c} className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                style={{ background: `${meta.color}cc` }}>{c}</span>
            ))}
          </div>
        )}

        {/* Pole specs */}
        {isPoles && !editing && (log.poles_set_count || log.pole_size) && (
          <div className="flex flex-wrap gap-3 text-sm rounded-xl px-4 py-2.5"
            style={{ background: `${meta.color}0d`, border: `1px solid ${meta.color}22` }}>
            {log.poles_set_count && <span className="font-bold" style={{ color: meta.color }}>🏗️ {log.poles_set_count} poles</span>}
            {log.pole_size && <span className="text-slate-600">📏 {log.pole_size}</span>}
            {log.pole_class && <span className="text-slate-600">🏷️ {log.pole_class}</span>}
            {log.pole_species && <span className="text-slate-600">🌲 {log.pole_species}</span>}
            {log.setting_method && <span className="text-slate-600">⚙️ {log.setting_method}</span>}
          </div>
        )}

        {/* Edit mode */}
        {editing && (
          <div className="rounded-xl p-4 space-y-3"
            style={{ background: `${meta.color}0a`, border: `1px solid ${meta.color}33` }}>
            <p className="font-semibold text-sm" style={{ color: meta.color }}>Editing Entry</p>
            {isPoles && (
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Poles Count', val: editCount, set: setEditCount, type: 'number' },
                  { label: 'Pole Size', val: editSize, set: setEditSize },
                  { label: 'Class', val: editClass, set: setEditClass },
                  { label: 'Method', val: editMethod, set: setEditMethod },
                ].map(({ label, val, set, type }) => (
                  <div key={label}>
                    <label className="text-xs text-slate-400">{label}</label>
                    <input type={type || 'text'}
                      className="w-full mt-0.5 border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-300"
                      value={val} onChange={e => set(e.target.value)} />
                  </div>
                ))}
              </div>
            )}
            <div>
              <label className="text-xs text-slate-400">Note</label>
              <textarea className="w-full mt-0.5 border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:border-indigo-300"
                value={editNote} onChange={e => setEditNote(e.target.value)} />
            </div>
            {log.chips_selected?.length > 0 && (
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Chips (click to toggle)</label>
                <div className="flex flex-wrap gap-1.5">
                  {log.chips_selected.map(c => {
                    const on = editChips.includes(c);
                    return (
                      <button key={c} onClick={() => setEditChips(p => p.includes(c) ? p.filter(x=>x!==c) : [...p,c])}
                        className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
                        style={on ? { background: meta.color, color: 'white' } : { background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={handleSave}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: meta.color }}>Save</button>
              <button onClick={() => setEditing(false)}
                className="px-4 py-2 rounded-xl text-sm text-slate-500 bg-slate-100">Cancel</button>
            </div>
          </div>
        )}

        {/* Note */}
        {log.note && !editing && (
          <div className="text-sm text-slate-600 italic bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100">
            "{log.note}"
          </div>
        )}

        {/* Weather */}
        {log.temperature && (
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span>🌡️ {log.temperature}°F</span>
            <span>💧 {log.humidity}%</span>
            <span>💨 {log.wind_speed} mph</span>
            <span>{log.weather_condition}</span>
            <HeatIndexBadge value={log.heat_index_value} />
          </div>
        )}

        {/* Photos */}
        {log.photo_paths?.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {log.photo_paths.map((p, i) => (
              <img key={i} src={p}
                className="w-16 h-16 object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity border border-slate-200"
                onClick={() => setLightboxPhoto(p)} alt="" />
            ))}
          </div>
        )}

        {/* Actions */}
        {!editing && (
          <div className="flex gap-2 pt-1">
            <button onClick={() => setEditing(true)}
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
              style={{ background: `${meta.color}12`, color: meta.color, border: `1px solid ${meta.color}30` }}>
              ✏️ Edit
            </button>
            <button onClick={handleDelete} disabled={deleting}
              className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-colors disabled:opacity-50">
              🗑️ {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)' }}
          onClick={() => setLightboxPhoto(null)}>
          <img src={lightboxPhoto} className="max-w-full max-h-full object-contain rounded-2xl" alt="" />
          <button className="absolute top-5 right-5 text-white/70 hover:text-white text-3xl w-12 h-12 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.1)' }}>×</button>
        </div>
      )}
    </div>
  );
}
