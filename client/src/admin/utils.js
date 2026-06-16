export const TYPE_META = {
  delay:     { label: 'Delay',              color: '#eab308', bg: '#422006', icon: '🟡' },
  completed: { label: 'Completed',          color: '#22c55e', bg: '#052e16', icon: '✅' },
  partial:   { label: 'Partial Completion', color: '#f97316', bg: '#431407', icon: '🟠' },
  equipment: { label: 'Equipment Issue',    color: '#3b82f6', bg: '#0c1a3a', icon: '🔧' },
  utility:   { label: 'Utility / Access',   color: '#a855f7', bg: '#2e1065', icon: '⚡' },
  safety:    { label: 'Safety Concern',     color: '#ef4444', bg: '#450a0a', icon: '🔴' },
};

export function fmtTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleString();
}

export function downloadCSV(rows) {
  const headers = [
    'id','crew_name','crew_number','truck_id','job_number','work_order',
    'entry_type','chips_selected','note','poles_set_count','pole_size',
    'pole_class','pole_species','setting_method','lat','lng','address',
    'temperature','humidity','wind_speed','weather_condition',
    'heat_index_value','heat_index_category','lightning_risk','timestamp'
  ];
  const escape = v => {
    if (v === null || v === undefined) return '';
    const s = Array.isArray(v) ? v.join(' | ') : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [
    headers.join(','),
    ...rows.map(r => headers.map(h => escape(r[h])).join(','))
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `fieldops-export-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
}
