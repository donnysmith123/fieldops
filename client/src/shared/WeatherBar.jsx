import HeatIndexBadge from './HeatIndexBadge';

export default function WeatherBar({ weather, address, loading }) {
  if (loading) {
    return (
      <div className="glass-dark px-4 py-2.5 flex items-center gap-2">
        <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        <span className="text-white/60 text-xs">Getting location & weather...</span>
      </div>
    );
  }
  if (!weather && !address) return null;
  return (
    <div className="glass-dark px-4 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-1">
      {address && <span className="text-white/80 text-xs">📍 {address}</span>}
      {weather && (
        <>
          <span className="text-white/70 text-xs">🌡️ {weather.temperature}°F</span>
          <span className="text-white/70 text-xs">💧 {weather.humidity}%</span>
          <span className="text-white/70 text-xs">💨 {weather.wind_speed} mph</span>
          <span className="text-white/70 text-xs">{weather.weather_condition}</span>
          <HeatIndexBadge value={weather.heat_index_value} />
        </>
      )}
    </div>
  );
}
