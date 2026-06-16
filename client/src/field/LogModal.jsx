import { useState, useRef, useEffect } from 'react';
import { CHIPS, POLE_SIZES, POLE_CLASSES, POLE_SPECIES, SETTING_METHODS } from './chips';
import HeatIndexBadge from '../shared/HeatIndexBadge';

const ENTRY_META = {
  delay:     { label: 'DELAY',                       gradient: 'linear-gradient(135deg,#ca8a04,#92400e)', accent: '#eab308' },
  completed: { label: 'POLES SET — COMPLETED',       gradient: 'linear-gradient(135deg,#16a34a,#065f46)', accent: '#22c55e' },
  partial:   { label: 'POLES SET — PARTIAL',         gradient: 'linear-gradient(135deg,#ea580c,#9a3412)', accent: '#f97316' },
  equipment: { label: 'EQUIPMENT ISSUE',             gradient: 'linear-gradient(135deg,#2563eb,#1e3a8a)', accent: '#3b82f6' },
  utility:   { label: 'UTILITY / SITE ACCESS ISSUE', gradient: 'linear-gradient(135deg,#9333ea,#4c1d95)', accent: '#a855f7' },
  safety:    { label: 'SAFETY CONCERN',              gradient: 'linear-gradient(135deg,#dc2626,#7f1d1d)', accent: '#ef4444' },
};

export default function LogModal({ entryType, weather, address, crew, onClose, onSubmit }) {
  const meta = ENTRY_META[entryType];
  const chips = CHIPS[entryType] || [];
  const isPoles = entryType === 'completed' || entryType === 'partial';

  const [selectedChips, setSelectedChips] = useState(
    entryType === 'delay' && weather?.lightning_risk ? ['Weather – Lightning Delay'] : []
  );
  const [note, setNote]         = useState('');
  const [listening, setListening] = useState(false);
  const [photos, setPhotos]     = useState([]);
  const [poleCount, setPoleCount]   = useState('');
  const [poleSize, setPoleSize]     = useState('');
  const [poleClass, setPoleClass]   = useState('');
  const [poleSpecies, setPoleSpecies] = useState('');
  const [settingMethod, setSettingMethod] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const recognitionRef = useRef(null);
  const fileRef = useRef(null);

  const toggleChip = chip =>
    setSelectedChips(prev => prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]);

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported in this browser.'); return; }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = e => {
      const t = Array.from(e.results).map(r => r[0].transcript).join(' ');
      setNote(t);
    };
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  };

  const stopListening = () => { recognitionRef.current?.stop(); setListening(false); };
  useEffect(() => () => recognitionRef.current?.stop(), []);

  const handlePhotos = e => {
    const files = Array.from(e.target.files);
    setPhotos(prev => [...prev, ...files.map(f => ({ file: f, url: URL.createObjectURL(f) }))]);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      let photoPaths = [];
      if (photos.length) {
        const fd = new FormData();
        photos.forEach(p => fd.append('photos', p.file));
        const up = await fetch('/api/upload', { method: 'POST', body: fd });
        photoPaths = (await up.json()).paths || [];
      }
      await onSubmit({
        ...crew, entry_type: entryType, chips_selected: selectedChips, note,
        poles_set_count: isPoles ? (parseInt(poleCount) || null) : null,
        pole_size: isPoles ? poleSize : null, pole_class: isPoles ? poleClass : null,
        pole_species: isPoles ? poleSpecies : null, setting_method: isPoles ? settingMethod : null,
        photo_paths: photoPaths,
        lat: weather?.lat, lng: weather?.lng, address,
        temperature: weather?.temperature, humidity: weather?.humidity,
        wind_speed: weather?.wind_speed, weather_condition: weather?.weather_condition,
        heat_index_value: weather?.heat_index_value, heat_index_category: weather?.heat_index_category,
        lightning_risk: weather?.lightning_risk || false,
        timestamp: new Date().toISOString(),
      });
    } finally { setSubmitting(false); }
  };

  const selectStyle = {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.18)',
    color: 'white',
    backdropFilter: 'blur(8px)',
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="flex-1 overflow-y-auto field-bg">

        {/* Sticky header */}
        <div className="sticky top-0 z-10 px-4 pt-safe pt-4 pb-3 flex items-center gap-3"
          style={{ background: meta.gradient, borderBottom: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)' }}>
          <button onClick={onClose} className="text-white/80 text-2xl w-10 h-10 flex items-center justify-center rounded-xl"
            style={{ background: 'rgba(0,0,0,0.2)' }}>←</button>
          <h2 className="text-white font-bold text-base flex-1 text-center pr-10">Logging: {meta.label}</h2>
        </div>

        <div className="px-4 py-5 space-y-5">

          {/* Chips */}
          {chips.length > 0 && (
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">Select all that apply</p>
              <div className="flex flex-wrap gap-2">
                {chips.map(chip => {
                  const active = selectedChips.includes(chip);
                  return (
                    <button key={chip} onClick={() => toggleChip(chip)}
                      className="px-3 py-2 rounded-full text-sm font-medium transition-all active:scale-95"
                      style={active
                        ? { background: meta.accent, color: 'white', boxShadow: `0 0 12px ${meta.accent}55` }
                        : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)' }
                      }
                    >{chip}</button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Poles form */}
          {isPoles && (
            <div className="glass rounded-2xl p-4 space-y-3">
              <p className="text-white font-semibold text-sm">Pole Details</p>
              <div>
                <label className="text-white/50 text-xs">Poles Set Count</label>
                <input type="number" className="glass-input w-full mt-1 rounded-xl px-3 py-3 text-xl font-bold"
                  placeholder="0" value={poleCount} onChange={e => setPoleCount(e.target.value)} />
              </div>
              {[
                { label: 'Pole Size', val: poleSize, set: setPoleSize, opts: POLE_SIZES },
                { label: 'Class',     val: poleClass, set: setPoleClass, opts: POLE_CLASSES },
                { label: 'Species',   val: poleSpecies, set: setPoleSpecies, opts: POLE_SPECIES },
                { label: 'Setting Method', val: settingMethod, set: setSettingMethod, opts: SETTING_METHODS },
              ].map(({ label, val, set, opts }) => (
                <div key={label}>
                  <label className="text-white/50 text-xs">{label}</label>
                  <select className="w-full mt-1 rounded-xl px-3 py-3 text-sm" style={selectStyle}
                    value={val} onChange={e => set(e.target.value)}>
                    <option value="" style={{ background: '#1e1b4b' }}>— Select —</option>
                    {opts.map(o => <option key={o} value={o} style={{ background: '#1e1b4b' }}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* Voice / Note */}
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Notes</p>
            <p className="text-white/35 text-xs mb-3">Describe what happened, pole locations, intersections...</p>
            <button
              onMouseDown={startListening} onMouseUp={stopListening}
              onTouchStart={startListening} onTouchEnd={stopListening}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl font-semibold text-sm mb-3 transition-all active:scale-95 select-none"
              style={listening
                ? { background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.6)', color: '#fca5a5', backdropFilter: 'blur(8px)' }
                : { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }
              }
            >
              🎤 {listening ? 'Listening...' : 'Hold to Speak'}
              {listening && <span className="inline-block w-2 h-2 bg-red-400 rounded-full animate-pulse" />}
            </button>
            <textarea
              className="glass-input w-full rounded-2xl px-4 py-3 min-h-[100px] text-base resize-none"
              placeholder="Type or use voice above..."
              value={note} onChange={e => setNote(e.target.value)}
            />
          </div>

          {/* Photos */}
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">Photos</p>
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-medium active:scale-95 transition-all"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
              📷 Add Photos
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple capture="environment"
              className="hidden" onChange={handlePhotos} />
            {photos.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {photos.map((p, i) => (
                  <div key={i} className="relative">
                    <img src={p.url} className="w-20 h-20 object-cover rounded-xl border border-white/20" alt="" />
                    <button onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Context preview */}
          <div className="glass rounded-2xl p-4 space-y-2">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">Auto-collected Context</p>
            <p className="text-white/70 text-sm">📍 {address || 'Location unavailable'}</p>
            {weather && (
              <>
                <p className="text-white/70 text-sm">🌡️ {weather.temperature}°F · 💧 {weather.humidity}% · 💨 {weather.wind_speed} mph · {weather.weather_condition}</p>
                <div><HeatIndexBadge value={weather.heat_index_value} /></div>
                {weather.lightning_risk && <p className="text-yellow-300 text-sm font-semibold">⚡ Lightning / High Wind Risk Active</p>}
              </>
            )}
            <p className="text-white/50 text-sm">🕐 {new Date().toLocaleTimeString()}</p>
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={submitting}
            className="w-full py-5 rounded-2xl font-bold text-lg text-white transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ background: meta.gradient, boxShadow: `0 0 30px ${meta.accent}44` }}>
            {submitting ? 'Submitting...' : '✓ Submit Log Entry'}
          </button>

          <div className="h-6" />
        </div>
      </div>
    </div>
  );
}
