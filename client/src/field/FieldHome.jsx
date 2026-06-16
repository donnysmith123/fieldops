import { useState, useEffect } from 'react';
import WeatherBar from '../shared/WeatherBar';
import LogModal from './LogModal';
import { fetchWeather, reverseGeocode } from '../lib/weather';
import { getHeatIndexCategory } from '../lib/heatIndex';
import { enqueue, flushQueue } from '../lib/offlineQueue';

const BUTTONS = [
  { type: 'delay',     label: 'DELAY',                        icon: '🟡', gradient: 'linear-gradient(135deg,#ca8a04,#92400e)', glow: 'btn-glow-yellow' },
  { type: 'completed', label: 'POLES SET — WORK COMPLETED',   icon: '✅', gradient: 'linear-gradient(135deg,#16a34a,#065f46)', glow: 'btn-glow-green'  },
  { type: 'partial',   label: 'POLES SET — PARTIAL',          icon: '🟠', gradient: 'linear-gradient(135deg,#ea580c,#9a3412)', glow: 'btn-glow-orange' },
  { type: 'equipment', label: 'EQUIPMENT ISSUE',               icon: '🔧', gradient: 'linear-gradient(135deg,#2563eb,#1e3a8a)', glow: 'btn-glow-blue'   },
  { type: 'utility',   label: 'UTILITY / SITE ACCESS ISSUE',  icon: '⚡', gradient: 'linear-gradient(135deg,#9333ea,#4c1d95)', glow: 'btn-glow-purple' },
  { type: 'safety',    label: 'OTHER / SAFETY CONCERN',       icon: '🔴', gradient: 'linear-gradient(135deg,#dc2626,#7f1d1d)', glow: 'btn-glow-red'    },
];

export default function FieldHome({ crew, onChangeCrew }) {
  const [weather, setWeather]         = useState(null);
  const [address, setAddress]         = useState('');
  const [coords, setCoords]           = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [manualAddress, setManualAddress]   = useState('');
  const [gpsError, setGpsError]       = useState(false);
  const [activeType, setActiveType]   = useState(null);
  const [submitted, setSubmitted]     = useState(false);
  const [dismissedHeat, setDismissedHeat]         = useState(false);
  const [dismissedLightning, setDismissedLightning] = useState(false);

  useEffect(() => {
    flushQueue().catch(() => {});
    if (!navigator.geolocation) { setGpsError(true); setWeatherLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoords({ lat, lng });
        const [addr, wx] = await Promise.all([reverseGeocode(lat, lng), fetchWeather(lat, lng)]);
        setAddress(addr);
        setWeather({ ...wx, lat, lng });
        setWeatherLoading(false);
      },
      () => { setGpsError(true); setWeatherLoading(false); }
    );
  }, []);

  const hiCat = weather ? getHeatIndexCategory(weather.heat_index_value) : null;
  const showHeatWarning    = hiCat && hiCat.level >= 3 && !dismissedHeat;
  const showLightningAlert = weather?.lightning_risk && !dismissedLightning;

  const handleSubmit = async entry => {
    const fullEntry = {
      ...entry,
      lat: coords?.lat,
      lng: coords?.lng,
      address: gpsError ? manualAddress : address,
    };
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullEntry),
      });
      if (!res.ok) throw new Error();
    } catch {
      enqueue(fullEntry);
    }
    setActiveType(null);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  };

  if (submitted) {
    return (
      <div className="field-bg min-h-dvh flex flex-col items-center justify-center p-6 text-center">
        <div className="glass rounded-3xl p-10 flex flex-col items-center gap-4 max-w-xs w-full">
          <div className="text-6xl">✅</div>
          <h2 className="text-2xl font-bold text-white">Entry Logged!</h2>
          <p className="text-white/50 text-sm">Returning to home screen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="field-bg min-h-dvh flex flex-col">
      {/* Decorative orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-20 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)' }} />
      </div>

      {/* Alerts */}
      {showLightningAlert && (
        <div className="relative z-20 mx-3 mt-3 rounded-2xl overflow-hidden flex items-start gap-3 px-4 py-3"
          style={{ background: 'rgba(234,179,8,0.25)', border: '1px solid rgba(234,179,8,0.5)', backdropFilter: 'blur(12px)' }}>
          <span className="text-lg">⚡</span>
          <p className="text-yellow-200 text-sm font-semibold flex-1">LIGHTNING / HIGH WIND ALERT — Consider delaying work</p>
          <button onClick={() => setDismissedLightning(true)} className="text-yellow-300 text-xl leading-none">×</button>
        </div>
      )}
      {showHeatWarning && (
        <div className="relative z-20 mx-3 mt-3 rounded-2xl overflow-hidden flex items-start gap-3 px-4 py-3"
          style={{ background: `${hiCat.color}22`, border: `1px solid ${hiCat.color}55`, backdropFilter: 'blur(12px)' }}>
          <span className="text-lg">{hiCat.emoji}</span>
          <p className="text-sm font-semibold flex-1" style={{ color: hiCat.color }}>
            HEAT {hiCat.label.toUpperCase()} — Heat Index {weather.heat_index_value}°F. Monitor crew.
          </p>
          <button onClick={() => setDismissedHeat(true)} className="text-xl leading-none" style={{ color: hiCat.color }}>×</button>
        </div>
      )}

      {/* Weather bar */}
      <WeatherBar weather={weather} address={gpsError ? manualAddress : address} loading={weatherLoading} />

      {/* GPS fallback */}
      {gpsError && (
        <div className="px-4 pt-3">
          <input
            className="glass-input w-full rounded-xl px-4 py-3 text-sm"
            placeholder="Enter location / address manually..."
            value={manualAddress}
            onChange={e => setManualAddress(e.target.value)}
          />
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 px-4 pt-4 pb-2">
        <div className="glass rounded-2xl px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-base leading-tight">Pole Distribution Field Log</h1>
            <p className="text-white/45 text-xs mt-0.5">{crew.crew_name} · {crew.truck_id} · Job {crew.job_number}</p>
          </div>
          <button
            onClick={onChangeCrew}
            className="text-white/60 text-xs glass px-3 py-1.5 rounded-xl active:scale-95 transition-transform"
          >
            ✏️ Edit
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="relative z-10 flex-1 px-4 py-3 flex flex-col gap-3">
        {BUTTONS.map(btn => (
          <button
            key={btn.type}
            onClick={() => setActiveType(btn.type)}
            className={`w-full rounded-2xl flex items-center gap-4 px-5 transition-all active:scale-[0.97] ${btn.glow}`}
            style={{ minHeight: '72px', background: btn.gradient }}
          >
            <span className="text-2xl flex-shrink-0">{btn.icon}</span>
            <span className="text-white font-bold text-base text-left leading-tight">{btn.label}</span>
          </button>
        ))}
      </div>

      <div className="relative z-10 text-center text-white/20 text-xs py-3">
        🕐 {new Date().toLocaleTimeString()} · FieldOps v1.0
      </div>

      {activeType && (
        <LogModal
          entryType={activeType}
          weather={weather}
          address={gpsError ? manualAddress : address}
          crew={crew}
          onClose={() => setActiveType(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
