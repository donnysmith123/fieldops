const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const { date } = req.query;
  const day = date || new Date().toISOString().split('T')[0];
  const start = day + 'T00:00:00';
  const end = day + 'T23:59:59';

  const rows = db.prepare(
    'SELECT * FROM logs WHERE timestamp >= ? AND timestamp <= ?'
  ).all(start, end);

  const parsed = rows.map(r => ({
    ...r,
    chips_selected: JSON.parse(r.chips_selected || '[]'),
    photo_paths: JSON.parse(r.photo_paths || '[]'),
    lightning_risk: !!r.lightning_risk
  }));

  const totalPolesSet = parsed
    .filter(r => r.entry_type === 'completed' || r.entry_type === 'partial')
    .reduce((sum, r) => sum + (r.poles_set_count || 0), 0);

  const byType = {};
  for (const r of parsed) {
    byType[r.entry_type] = (byType[r.entry_type] || 0) + 1;
  }

  const delayBreakdown = {};
  for (const r of parsed.filter(r => r.entry_type === 'delay')) {
    for (const chip of r.chips_selected) {
      delayBreakdown[chip] = (delayBreakdown[chip] || 0) + 1;
    }
  }

  const byCrewMap = {};
  for (const r of parsed) {
    const key = r.crew_name || 'Unknown';
    if (!byCrewMap[key]) byCrewMap[key] = { poles: 0, entries: 0 };
    byCrewMap[key].entries++;
    if (r.entry_type === 'completed' || r.entry_type === 'partial') {
      byCrewMap[key].poles += r.poles_set_count || 0;
    }
  }

  res.json({
    date: day,
    total_entries: parsed.length,
    total_poles_set: totalPolesSet,
    by_type: byType,
    delay_breakdown: delayBreakdown,
    by_crew: byCrewMap
  });
});

module.exports = router;
