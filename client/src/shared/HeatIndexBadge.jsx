import { getHeatIndexCategory } from '../lib/heatIndex';

export default function HeatIndexBadge({ value, category, size = 'sm' }) {
  if (!value) return null;
  const cat = getHeatIndexCategory(value);
  const pad = size === 'lg' ? 'px-4 py-2 text-sm font-bold' : 'px-2.5 py-1 text-xs font-semibold';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ${pad}`}
      style={{
        background: `${cat.color}22`,
        color: cat.color,
        border: `1px solid ${cat.color}55`,
        backdropFilter: 'blur(8px)',
      }}
    >
      {cat.emoji} {cat.label} {value}°F
    </span>
  );
}
