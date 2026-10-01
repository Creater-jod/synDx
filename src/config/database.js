const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { DB_PATH, DEFAULT_ADMIN_PASSWORD } = require('./env');

// Ensure parent data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('[DB Error] Failed to open SQLite database:', err.message);
  } else {
    console.log('[+] Connected to SQLite database at:', DB_PATH);
    initDatabase();
  }
});

// Promisified database helpers using parameterized queries
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function initDatabase() {
  db.serialize(() => {
    // 1. Users Table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL,
        specialty TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Cases Table
    db.run(`
      CREATE TABLE IF NOT EXISTS cases (
        id TEXT PRIMARY KEY,
        condition TEXT NOT NULL,
        tier TEXT NOT NULL,
        confidence INTEGER NOT NULL,
        emergency INTEGER NOT NULL,
        day TEXT NOT NULL,
        time TEXT NOT NULL,
        status TEXT NOT NULL,
        note TEXT,
        features_json TEXT,
        vitals_json TEXT,
        referral_json TEXT,
        audit_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Audit Trail Table
    db.run(`
      CREATE TABLE IF NOT EXISTS audit_trail (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        case_hash TEXT NOT NULL,
        diagnosis_hash TEXT NOT NULL,
        model_version TEXT NOT NULL,
        tx_hash TEXT,
        block_number INTEGER,
        status TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Facilities Table
    db.run(`
      CREATE TABLE IF NOT EXISTS facilities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        specialty TEXT NOT NULL,
        distance_km REAL NOT NULL,
        icu_beds INTEGER NOT NULL,
        drug_stock TEXT NOT NULL,
        emergency_level TEXT NOT NULL,
        address TEXT
      )
    `);

    // 5. Processed Mutations Table (Idempotent Sync Queue Deduplication)
    db.run(`
      CREATE TABLE IF NOT EXISTS processed_mutations (
        mutation_id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        response_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);


    // Seed default users if empty
    db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => {
      if (row && row.count === 0) {
        const passwordHash = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10);
        db.run('INSERT INTO users (username, password_hash, full_name, role, specialty) VALUES (?, ?, ?, ?, ?)',
          ['healthworker', passwordHash, 'Community Health Officer', 'health_worker', 'Primary Triage']);
        db.run('INSERT INTO users (username, password_hash, full_name, role, specialty) VALUES (?, ?, ?, ?, ?)',
          ['doctor', passwordHash, 'Dr. Reviewer', 'doctor', 'Genetics & Rare Diseases']);
        db.run('INSERT INTO users (username, password_hash, full_name, role, specialty) VALUES (?, ?, ?, ?, ?)',
          ['clinicadmin', passwordHash, 'District Health Admin', 'clinic_admin', 'Facility Operations']);
        db.run('INSERT INTO users (username, password_hash, full_name, role, specialty) VALUES (?, ?, ?, ?, ?)',
          ['sysadmin', passwordHash, 'System Administrator', 'system_admin', 'ML & Infrastructure']);
        console.log('[+] Seeded default application users (healthworker, doctor, clinicadmin, sysadmin).');
      }
    });

    // Seed default facilities if empty
    db.get('SELECT COUNT(*) as count FROM facilities', [], (err, row) => {
      if (row && row.count === 0) {
        const seedFacilities = [
          { id: 'FAC-01', name: 'City General — Emergency & Trauma Centre', specialty: 'Emergency & Critical Care', distance_km: 1.8, icu_beds: 12, drug_stock: 'yes', emergency_level: 'Level 1 Trauma', address: '100 Metro Health Blvd' },
          { id: 'FAC-02', name: 'District Rare Disease & Genetics Centre', specialty: 'Genetics & Inborn Errors', distance_km: 4.2, icu_beds: 4, drug_stock: 'yes', emergency_level: 'Secondary', address: '45 University Ave' },
          { id: 'FAC-03', name: 'University Multi-specialty — Hepatology', specialty: 'Hepatology & Liver Transplant', distance_km: 7.0, icu_beds: 8, drug_stock: 'low', emergency_level: 'Tertiary', address: '88 Academic Medical Way' },
          { id: 'FAC-04', name: 'District Cardiology & Vascular Unit', specialty: 'Cardiology & Aortic Care', distance_km: 5.4, icu_beds: 6, drug_stock: 'yes', emergency_level: 'Secondary', address: '12 Heartway Plaza' },
          { id: 'FAC-05', name: 'Regional Pulmonology & Cystic Care', specialty: 'Pediatric & Adult Pulmonology', distance_km: 6.3, icu_beds: 5, drug_stock: 'yes', emergency_level: 'Secondary', address: '304 Highland Cross' },
          { id: 'FAC-06', name: 'District Rheumatology Centre', specialty: 'Rheumatology & Connective Tissue', distance_km: 3.8, icu_beds: 2, drug_stock: 'yes', emergency_level: 'Community', address: '19 Park View Lane' }
        ];
        const stmt = db.prepare('INSERT INTO facilities (id, name, specialty, distance_km, icu_beds, drug_stock, emergency_level, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        seedFacilities.forEach(f => {
          stmt.run(f.id, f.name, f.specialty, f.distance_km, f.icu_beds, f.drug_stock, f.emergency_level, f.address);
        });
        stmt.finalize();
        console.log('[+] Seeded specialized clinical referral facilities.');
      }
    });

    // Seed default cases if empty
    db.get('SELECT COUNT(*) as count FROM cases', [], (err, row) => {
      if (row && row.count === 0) {
        const seedCases = [
          {
            id: "CASE-8F3A1C", condition: "Acute Porphyria — crisis pattern", tier: "A", confidence: 88, emergency: 1, day: "today", time: "2 min ago", status: "pending", note: "",
            features: JSON.stringify([{ label: "Systolic BP deviation", value: 34 }, { label: "Heart rate elevation", value: 28 }, { label: "Abdominal pain severity score", value: 22 }, { label: "Reported neuro symptoms", value: 16 }]),
            vitals: JSON.stringify({ spo2: 94, hr: 122, bp: "158/98", temp: 37.8 }),
            referral: JSON.stringify({ name: "City General — Emergency Dept.", distance: "1.8 km", stock: "yes" }),
            audit: JSON.stringify({ case_hash: "8f3a1c9ed204", diagnosis_hash: "4b7e02aa91f6", model: "synDx-edge-nb-v1.0" })
          },
          {
            id: "CASE-2D91EE", condition: "Ehlers-Danlos Syndrome", tier: "A", confidence: 92, emergency: 0, day: "today", time: "14 min ago", status: "pending", note: "",
            features: JSON.stringify([{ label: "Joint hypermobility score", value: 41 }, { label: "Skin elasticity index", value: 27 }, { label: "Chronic pain duration", value: 19 }, { label: "Family history flag", value: 13 }]),
            vitals: JSON.stringify({ spo2: 98, hr: 78, bp: "118/76", temp: 36.6 }),
            referral: JSON.stringify({ name: "District Rheumatology Centre", distance: "4.2 km", stock: "yes" }),
            audit: JSON.stringify({ case_hash: "2d91ee407a3c", diagnosis_hash: "9c1f88de0b12", model: "synDx-edge-nb-v1.0" })
          },
          {
            id: "CASE-6B0C77", condition: "Wilson's Disease", tier: "B", confidence: 71, emergency: 0, day: "today", time: "26 min ago", status: "pending", note: "",
            features: JSON.stringify([{ label: "Ceruloplasmin deviation", value: 33 }, { label: "Hepatic enzyme pattern", value: 25 }, { label: "Tremor onset age", value: 21 }, { label: "Kayser-Fleischer indicator", value: 11 }]),
            vitals: JSON.stringify({ spo2: 97, hr: 82, bp: "124/80", temp: 36.8 }),
            referral: JSON.stringify({ name: "City Multi-specialty — Hepatology", distance: "7.0 km", stock: "low" }),
            audit: JSON.stringify({ case_hash: "6b0c7712f890", diagnosis_hash: "aa73c501de44", model: "synDx-edge-nb-v1.0" })
          },
          {
            id: "CASE-A417F2", condition: "Marfan Syndrome", tier: "B", confidence: 76, emergency: 0, day: "today", time: "41 min ago", status: "confirmed",
            note: "Confirmed per echo report attached; scheduled cardiology follow-up.",
            features: JSON.stringify([{ label: "Limb-to-height ratio", value: 30 }, { label: "Lens dislocation flag", value: 24 }, { label: "Aortic root measurement trend", value: 22 }]),
            vitals: JSON.stringify({ spo2: 99, hr: 72, bp: "120/78", temp: 36.7 }),
            referral: JSON.stringify({ name: "District Cardiology Unit", distance: "5.4 km", stock: "yes" }),
            audit: JSON.stringify({ case_hash: "a417f2883c9a", diagnosis_hash: "115e9b0a77d3", model: "synDx-edge-nb-v1.0" })
          }
        ];

        const stmt = db.prepare('INSERT INTO cases (id, condition, tier, confidence, emergency, day, time, status, note, features_json, vitals_json, referral_json, audit_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        seedCases.forEach(c => {
          stmt.run(c.id, c.condition, c.tier, c.confidence, c.emergency, c.day, c.time, c.status, c.note, c.features, c.vitals, c.referral, c.audit);
        });
        stmt.finalize();

        // Seed audit trail
        db.run('INSERT INTO audit_trail (case_id, event_type, case_hash, diagnosis_hash, model_version, tx_hash, block_number, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          ['CASE-8F3A1C', 'INFERENCE_GENERATED', '8f3a1c9e4b7e02aa', '4b7e02aa91f6c503', 'synDx-edge-nb-v1.0', '0x9a8f7c6e5d4c3b2a10f9e8d7c6b5a493', 1849204, 'CONFIRMED']);
        console.log('[+] Seeded baseline clinical cases into SQLite.');
      }
    });
  });
}

module.exports = {
  db,
  get,
  all,
  run
};
