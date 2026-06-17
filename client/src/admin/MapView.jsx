import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { TYPE_META, fmtTime } from './utils';
import HeatIndexBadge from '../shared/HeatIndexBadge';

// Auto-fit map bounds to markers
function FitBounds({ logs }) {
  const map = useMap();
  useEffect(() => {
    const points = logs.filter(l => l.lat && l.lng).map(l => [l.lat, l.lng]);
    if (points.length === 0) return;
    if (points.length === 1) { map.setView(points[0], 14); return; }
    const lats = points.map(p => p[0]);
    const lngs = points.map(p => p[1]);
    map.fitBounds(
      [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]],
      { padding: [40, 40], maxZoom: 16 }
    );
  }, [logs, map]);
  return null;
}

export default function MapView({ logs }) {
  const withCoords = logs.filter(l => l.lat && l.lng);
  const center = withCoords.length > 0
    ? [withCoords[0].lat, withCoords[0].lng]
    : [39.5, -98.35]; // US center fallback

  if (withCoords.length === 0) {
    return (
      <div className="glass-light rounded-2xl flex flex-col items-center justify-center py-20 text-slate-400 mb-5">
        <div className="text-4xl mb-3">🗺️</div>
        <p className="font-medium">No entries with GPS coordinates in this filter range.</p>
        <p className="text-sm mt-1">Entries logged with GPS enabled will appear here.</p>
      </div>
    );
  }

  return (
    <div className="glass-light rounded-2xl overflow-hidden mb-5" style={{ boxShadow: '0 4px 24px rgba(99,102,241,0.12)' }}>
      {/* Map header */}
      <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-200/60">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-slate-700">🗺️ Field Map</span>
          <span className="text-xs text-slate-400 font-medium">{withCoords.length} entries with GPS</span>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {Object.entries(TYPE_META).map(([key, m]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: m.color, boxShadow: `0 0 6px ${m.color}88` }} />
              <span className="text-xs text-slate-500">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '500px', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds logs={withCoords} />
        {withCoords.map(log => {
          const meta = TYPE_META[log.entry_type] || TYPE_META.delay;
          return (
            <CircleMarker
              key={log.id}
              center={[log.lat, log.lng]}
              radius={10}
              pathOptions={{
                color: meta.color,
                fillColor: meta.color,
                fillOpacity: 0.85,
                weight: 2,
              }}
            >
              <Popup maxWidth={280} className="fieldops-popup">
                <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', minWidth: '220px' }}>
                  {/* Type badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{
                      background: `${meta.color}22`,
                      color: meta.color,
                      border: `1px solid ${meta.color}44`,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}>
                      {meta.icon} {meta.label}
                    </span>
                  </div>

                  {/* Crew info */}
                  <div style={{ fontSize: '13px', color: '#374151', marginBottom: '6px' }}>
                    {log.crew_name && <div><strong>👷 {log.crew_name}</strong></div>}
                    {log.truck_id && <div style={{ color: '#6b7280' }}>🚛 {log.truck_id}</div>}
                    {log.job_number && <div style={{ color: '#6b7280' }}>📋 Job #{log.job_number}</div>}
                  </div>

                  {/* Timestamp */}
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '6px' }}>
                    🕐 {fmtTime(log.timestamp)}
                  </div>

                  {/* Address */}
                  {log.address && (
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px' }}>
                      📍 {log.address}
                    </div>
                  )}

                  {/* Pole specs */}
                  {(log.entry_type === 'completed' || log.entry_type === 'partial') && log.poles_set_count && (
                    <div style={{
                      background: `${meta.color}0d`,
                      border: `1px solid ${meta.color}22`,
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontSize: '12px',
                      color: '#374151',
                      marginBottom: '6px',
                    }}>
                      🏗️ <strong style={{ color: meta.color }}>{log.poles_set_count} poles</strong>
                      {log.pole_size && ` · ${log.pole_size}`}
                      {log.pole_class && ` · ${log.pole_class}`}
                      {log.setting_method && ` · ${log.setting_method}`}
                    </div>
                  )}

                  {/* Chips */}
                  {log.chips_selected?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                      {log.chips_selected.map(c => (
                        <span key={c} style={{
                          background: `${meta.color}cc`,
                          color: 'white',
                          fontSize: '10px',
                          fontWeight: 600,
                          padding: '2px 6px',
                          borderRadius: '999px',
                        }}>{c}</span>
                      ))}
                    </div>
                  )}

                  {/* Note */}
                  {log.note && (
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      fontStyle: 'italic',
                      background: '#f9fafb',
                      borderRadius: '6px',
                      padding: '6px 8px',
                      marginBottom: '6px',
                    }}>
                      "{log.note}"
                    </div>
                  )}

                  {/* Weather */}
                  {log.temperature && (
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                      🌡️ {log.temperature}°F · 💧 {log.humidity}% · 💨 {log.wind_speed} mph
                      {log.heat_index_value && (
                        <span style={{ marginLeft: '4px', fontWeight: 600, color: log.heat_index_value >= 103 ? '#ea580c' : '#16a34a' }}>
                          · HI {log.heat_index_value}°F
                        </span>
                      )}
                    </div>
                  )}

                  {/* Google Maps link */}
                  <a
                    href={`https://maps.google.com/?q=${log.lat},${log.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-block',
                      marginTop: '8px',
                      fontSize: '11px',
                      color: meta.color,
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    Open in Google Maps →
                  </a>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
