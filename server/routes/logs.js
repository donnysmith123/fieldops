const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/logs
router.get('/', (req, res) => {
  const { start, end, crew_name, crew_number, job_number, entry_type, pole_size, pole_class } = req.query;

  let query = 'SELECT * FROM logs WHERE 1=1';
  const params = [];

  if (start) { query += ' AND timestamp >= ?'; params.push(start); }
  if (end) { query += ' AND timestamp <= ?'; params.push(end + 'T23:59:59'); }
  if (crew_name) { query += ' AND crew_name LIKE ?'; params.push(`%${crew_name}%`); }
  if (crew_number) { query += ' AND crew_number LIKE ?'; params.push(`%${crew_number}%`); }
  if (job_number) { query += ' AND job_number LIKE ?'; params.push(`%${job_number}%`); }
  if (entry_type) { query += ' AND entry_type = ?'; params.push(entry_type); }
  if (pole_size) { query += ' AND pole_size = ?'; params.push(pole_size); }
  if (pole_class) { query += ' AND pole_class = ?'; params.push(pole_class); }

  query += ' ORDER BY created_at DESC';

  const rows = db.prepare(query).all(...params);
  const parsed = rows.map(r => ({
    ...r,
    chips_selected: JSON.parse(r.chips_selected || '[]'),
    photo_paths: JSON.parse(r.photo_paths || '[]'),
    lightning_risk: !!r.lightning_risk
  }));
  res.json(parsed);
});

// POST /api/logs
router.post('/', (req, res) => {
  const {
    crew_name, crew_number, truck_id, job_number, work_order,
    entry_type, chips_selected, note,
    poles_set_count, pole_size, pole_class, pole_species, setting_method,
    photo_paths, lat, lng, address,
    temperature, humidity, wind_speed, weather_condition,
    heat_index_value, heat_index_category, lightning_risk, timestamp
  } = req.body;

  const stmt = db.prepare(`
    INSERT INTO logs (
      crew_name, crew_number, truck_id, job_number, work_order,
      entry_type, chips_selected, note,
      poles_set_count, pole_size, pole_class, pole_species, setting_method,
      photo_paths, lat, lng, address,
      temperature, humidity, wind_speed, weather_condition,
      heat_index_value, heat_index_category, lightning_risk, timestamp
    ) VALUES (
      ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
    )
  `);

  const result = stmt.run(
    crew_name, crew_number, truck_id, job_number, work_order,
    entry_type,
    JSON.stringify(chips_selected || []),
    note,
    poles_set_count || null, pole_size, pole_class, pole_species, setting_method,
    JSON.stringify(photo_paths || []),
    lat, lng, address,
    temperature, humidity, wind_speed, weather_condition,
    heat_index_value, heat_index_category,
    lightning_risk ? 1 : 0,
    timestamp || new Date().toISOString()
  );

  const created = db.prepare('SELECT * FROM logs WHERE id = ?').get(result.lastInsertRowid);
  created.chips_selected = JSON.parse(created.chips_selected || '[]');
  created.photo_paths = JSON.parse(created.photo_paths || '[]');
  created.lightning_risk = !!created.lightning_risk;
  res.status(201).json(created);
});

// PATCH /api/logs/:id
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { note, chips_selected, poles_set_count, pole_size, pole_class, pole_species, setting_method } = req.body;

  const existing = db.prepare('SELECT * FROM logs WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  db.prepare(`
    UPDATE logs SET
      note = ?,
      chips_selected = ?,
      poles_set_count = ?,
      pole_size = ?,
      pole_class = ?,
      pole_species = ?,
      setting_method = ?
    WHERE id = ?
  `).run(
    note !== undefined ? note : existing.note,
    chips_selected !== undefined ? JSON.stringify(chips_selected) : existing.chips_selected,
    poles_set_count !== undefined ? poles_set_count : existing.poles_set_count,
    pole_size !== undefined ? pole_size : existing.pole_size,
    pole_class !== undefined ? pole_class : existing.pole_class,
    pole_species !== undefined ? pole_species : existing.pole_species,
    setting_method !== undefined ? setting_method : existing.setting_method,
    id
  );

  const updated = db.prepare('SELECT * FROM logs WHERE id = ?').get(id);
  updated.chips_selected = JSON.parse(updated.chips_selected || '[]');
  updated.photo_paths = JSON.parse(updated.photo_paths || '[]');
  updated.lightning_risk = !!updated.lightning_risk;
  res.json(updated);
});

// DELETE /api/logs/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM logs WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM logs WHERE id = ?').run(id);
  res.json({ success: true });
});

module.exports = router;
