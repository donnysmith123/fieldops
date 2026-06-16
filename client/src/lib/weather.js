import { calcHeatIndex, getHeatIndexCategory } from './heatIndex';

export async function fetchWeather(lat, lng) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph`;
  const res = await fetch(url);
  const data = await res.json();
  const c = data.current;

  const temp = Math.round(c.temperature_2m);
  const humidity = c.relative_humidity_2m;
  const wind = Math.round(c.wind_speed_10m);
  const code = c.weather_code;

  const condition = wmoDescription(code);
  const isThunder = code >= 95;
  const lightningRisk = isThunder || wind > 35;

  const hi = calcHeatIndex(temp, humidity);
  const hiCat = getHeatIndexCategory(hi);

  return {
    temperature: temp,
    humidity,
    wind_speed: wind,
    weather_condition: condition,
    weather_code: code,
    heat_index_value: hi,
    heat_index_category: hiCat.label,
    lightning_risk: lightningRisk
  };
}

function wmoDescription(code) {
  if (code === 0) return 'Clear Sky';
  if (code <= 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code <= 49) return 'Foggy';
  if (code <= 57) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Rain Showers';
  if (code <= 86) return 'Snow Showers';
  if (code <= 94) return 'Thunderstorm';
  return 'Thunderstorm with Hail';
}

export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const d = await res.json();
    const a = d.address || {};
    const parts = [a.road, a.suburb || a.village || a.town || a.city, a.state].filter(Boolean);
    return parts.join(', ') || d.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}
