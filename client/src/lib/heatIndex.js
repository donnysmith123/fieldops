// Rothfusz regression equation for heat index
export function calcHeatIndex(tempF, rh) {
  if (tempF < 80) return tempF;
  const hi =
    -42.379 +
    2.04901523 * tempF +
    10.14333127 * rh -
    0.22475541 * tempF * rh -
    0.00683783 * tempF * tempF -
    0.05481717 * rh * rh +
    0.00122874 * tempF * tempF * rh +
    0.00085282 * tempF * rh * rh -
    0.00000199 * tempF * tempF * rh * rh;
  return Math.round(hi);
}

export function getHeatIndexCategory(hi) {
  if (hi >= 130) return { label: 'Extreme Danger', color: '#7c0000', bg: '#fee2e2', emoji: '☠️', level: 5 };
  if (hi >= 115) return { label: 'Danger', color: '#dc2626', bg: '#fecaca', emoji: '🚨', level: 4 };
  if (hi >= 103) return { label: 'Warning', color: '#ea580c', bg: '#fed7aa', emoji: '🔶', level: 3 };
  if (hi >= 91)  return { label: 'Caution', color: '#ca8a04', bg: '#fef08a', emoji: '⚠️', level: 2 };
  return { label: 'Lower Risk', color: '#16a34a', bg: '#dcfce7', emoji: '✅', level: 1 };
}
