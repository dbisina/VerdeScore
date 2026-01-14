const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'greenloan.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Initialize Tables
db.run(`CREATE TABLE IF NOT EXISTS loans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        applicant_name TEXT,
        amount REAL,
        purpose TEXT,
        green_score INTEGER,
        risk_score INTEGER,
        recommendation TEXT,
        roi_projection REAL,
        status TEXT DEFAULT 'PENDING',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        impact_co2_tonnes REAL DEFAULT 0,
        impact_trees_planted INTEGER DEFAULT 0,
        impact_energy_kwh REAL DEFAULT 0,
        repayment_velocity REAL DEFAULT 0,
        default_probability REAL DEFAULT 0,
        reasoning TEXT,
        semantic_category TEXT,
        lma_compliant INTEGER DEFAULT 0,
        eu_taxonomy_eligible INTEGER DEFAULT 0,
        processing_time_ms INTEGER DEFAULT 0,
        analysis_version TEXT DEFAULT '2.0.0'
    )`);

// Attempt to add new columns for v2.0 (Migration for existing DB)
const columnsToAdd = [
    "ALTER TABLE loans ADD COLUMN impact_co2_tonnes REAL DEFAULT 0",
    "ALTER TABLE loans ADD COLUMN impact_trees_planted INTEGER DEFAULT 0",
    "ALTER TABLE loans ADD COLUMN impact_energy_kwh REAL DEFAULT 0",
    "ALTER TABLE loans ADD COLUMN repayment_velocity REAL DEFAULT 0",
    "ALTER TABLE loans ADD COLUMN default_probability REAL DEFAULT 0",
    "ALTER TABLE loans ADD COLUMN reasoning TEXT",
    "ALTER TABLE loans ADD COLUMN semantic_category TEXT",
    "ALTER TABLE loans ADD COLUMN lma_compliant INTEGER DEFAULT 0",
    "ALTER TABLE loans ADD COLUMN eu_taxonomy_eligible INTEGER DEFAULT 0",
    "ALTER TABLE loans ADD COLUMN processing_time_ms INTEGER DEFAULT 0",
    "ALTER TABLE loans ADD COLUMN analysis_version TEXT DEFAULT '2.0.0'"
];

columnsToAdd.forEach(sql => {
    db.run(sql, (err) => {
        // Ignore error if column already exists
    });
});

// Trades table
db.run(`CREATE TABLE IF NOT EXISTS trades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        loan_id INTEGER,
        investor_name TEXT,
        amount REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(loan_id) REFERENCES loans(id)
    )`);

// Team members table
db.run(`CREATE TABLE IF NOT EXISTS team_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        role TEXT,
        email TEXT,
        access TEXT,
        status TEXT,
        avatar TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
    if (!err) {
        db.get("SELECT count(*) as count FROM team_members", [], (err, row) => {
            if (row && row.count === 0) {
                const seedSql = `INSERT INTO team_members (name, role, email, access, status, avatar) VALUES (?, ?, ?, ?, ?, ?)`;
                db.run(seedSql, ["Sarah Chen", "Senior Sustainability Officer", "sarah.chen@verdebank.com", "Admin", "Active", "SC"]);
                db.run(seedSql, ["Marcus Johnson", "Risk Analyst", "m.johnson@verdebank.com", "Editor", "Active", "MJ"]);
                db.run(seedSql, ["Elena Rodriguez", "Compliance Manager", "e.rodriguez@verdebank.com", "Viewer", "Away", "ER"]);
                console.log("Seeded team_members table");
            }
        });
    }
});

// ================== NEW: Audit Trail Table ==================
db.run(`CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        loan_id INTEGER,
        applicant_name TEXT,
        amount REAL,
        
        -- Decision fields
        green_score INTEGER,
        risk_score INTEGER,
        recommendation TEXT,
        
        -- Attribution breakdown (JSON)
        attribution_json TEXT,
        
        -- Evidence chain (JSON)
        evidence_json TEXT,
        
        -- Analysis metadata
        analysis_source TEXT,
        confidence_level TEXT,
        processing_time_ms INTEGER,
        model_version TEXT,
        input_hash TEXT,
        
        -- Timestamp
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

// ================== NEW: Processing Benchmarks Table ==================
db.run(`CREATE TABLE IF NOT EXISTS processing_benchmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        loan_id INTEGER,
        
        -- Timing breakdown
        total_time_ms INTEGER,
        semantic_analysis_ms INTEGER,
        lma_compliance_ms INTEGER,
        eu_taxonomy_ms INTEGER,
        ai_api_ms INTEGER,
        
        -- Processing metadata
        analysis_source TEXT,
        used_api_embedding INTEGER DEFAULT 0,
        used_api_chat INTEGER DEFAULT 0,
        
        -- Comparison metrics
        estimated_manual_hours REAL DEFAULT 96,
        efficiency_multiple TEXT,
        
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

// ================== NEW: Analysis Sessions Table ==================
db.run(`CREATE TABLE IF NOT EXISTS analysis_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT UNIQUE,
        start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        end_time DATETIME,
        loans_processed INTEGER DEFAULT 0,
        avg_processing_time_ms INTEGER,
        total_time_saved_hours REAL,
        
        -- Aggregate stats for session
        avg_green_score REAL,
        avg_risk_score REAL,
        approval_rate REAL,
        
        status TEXT DEFAULT 'ACTIVE'
    )`);

// Helper function to log audit entry
function logAuditEntry(auditEntry) {
    const sql = `INSERT INTO audit_log (
        loan_id, applicant_name, amount,
        green_score, risk_score, recommendation,
        attribution_json, evidence_json,
        analysis_source, confidence_level, processing_time_ms,
        model_version, input_hash
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        auditEntry.application_id,
        auditEntry.applicant,
        auditEntry.amount,
        auditEntry.final_score,
        auditEntry.risk_score,
        auditEntry.recommendation,
        JSON.stringify(auditEntry.attribution_summary),
        JSON.stringify(auditEntry.evidence),
        auditEntry.analysis_source,
        auditEntry.confidence_level,
        auditEntry.processing_time_ms,
        auditEntry.model_version,
        auditEntry.input_hash
    ];

    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
}

// Helper function to log benchmark
function logBenchmark(loanId, benchmarkData) {
    const sql = `INSERT INTO processing_benchmarks (
        loan_id, total_time_ms, semantic_analysis_ms, lma_compliance_ms,
        eu_taxonomy_ms, ai_api_ms, analysis_source,
        used_api_embedding, used_api_chat, estimated_manual_hours, efficiency_multiple
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        loanId,
        benchmarkData.total_time_ms || 0,
        benchmarkData.semantic_ms || 0,
        benchmarkData.lma_ms || 0,
        benchmarkData.eu_ms || 0,
        benchmarkData.ai_api_ms || 0,
        benchmarkData.analysis_source || 'local',
        benchmarkData.used_api_embedding ? 1 : 0,
        benchmarkData.used_api_chat ? 1 : 0,
        benchmarkData.manual_hours || 96,
        benchmarkData.efficiency_multiple || 'N/A'
    ];

    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
}

// Helper to get benchmark statistics
function getBenchmarkStats() {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                COUNT(*) as total_processed,
                AVG(total_time_ms) as avg_processing_ms,
                MIN(total_time_ms) as min_processing_ms,
                MAX(total_time_ms) as max_processing_ms,
                SUM(estimated_manual_hours) as total_manual_hours_saved,
                AVG(CASE WHEN used_api_chat = 1 THEN total_time_ms END) as avg_with_api,
                AVG(CASE WHEN used_api_chat = 0 THEN total_time_ms END) as avg_without_api
            FROM processing_benchmarks
        `;

        db.get(sql, [], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

module.exports = db;
module.exports.logAuditEntry = logAuditEntry;
module.exports.logBenchmark = logBenchmark;
module.exports.getBenchmarkStats = getBenchmarkStats;
