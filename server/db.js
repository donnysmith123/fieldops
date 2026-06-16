const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'fieldops.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crew_name TEXT,
    crew_number TEXT,
    truck_id TEXT,
    job_number TEXT,
    work_order TEXT,
    entry_type TEXT NOT NULL,
    chips_selected TEXT DEFAULT '[]',
    note TEXT,
    poles_set_count INTEGER,
    pole_size TEXT,
    pole_class TEXT,
    pole_species TEXT,
    setting_method TEXT,
    photo_paths TEXT DEFAULT '[]',
    lat REAL,
    lng REAL,
    address TEXT,
    temperature REAL,
    humidity REAL,
    wind_speed REAL,
    weather_condition TEXT,
    heat_index_value REAL,
    heat_index_category TEXT,
    lightning_risk INTEGER DEFAULT 0,
    timestamp TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

module.exports = db;
