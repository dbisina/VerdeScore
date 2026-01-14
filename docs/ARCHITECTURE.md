# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        VerdeScore Platform                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────────┐   │
│  │   Frontend  │────▶│   Backend   │────▶│   AI Module     │   │
│  │  React/Vite │     │   Express   │     │  Semantic AI    │   │
│  │  Port 5173  │     │  Port 3001  │     │                 │   │
│  └─────────────┘     └──────┬──────┘     └────────┬────────┘   │
│                              │                     │             │
│                              ▼                     ▼             │
│                       ┌─────────────┐     ┌─────────────────┐   │
│                       │   SQLite    │     │  DeepSeek API   │   │
│                       │   Database  │     │  (Optional)     │   │
│                       └─────────────┘     └─────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend (React + Vite)
- **Location**: `/frontend`
- **Port**: 5173 (dev), can be built and served statically
- **Key Components**:
  - `LandingHero.jsx` - Main landing page
  - `NewLoanForm.jsx` - Loan submission form
  - `LoanDetailsPage.jsx` - Detailed loan view with explainability
  - `Dashboard.jsx` - Overview metrics
  - `MinimalistDock.jsx` - Navigation

### Backend (Express + SQLite)
- **Location**: `/backend`
- **Port**: 3001
- **Files**:
  - `server.js` - Express API routes
  - `database.js` - SQLite schema and helpers
  - `openapi.yaml` - API specification

### AI Module
- **Location**: `/ai-module`
- **Components**:
  - `index.js` - Main orchestrator
  - `semantic-analyzer.js` - Embedding-based scoring
  - `lma-compliance.js` - LMA Green Loan Principles
  - `eu-taxonomy.js` - EU Taxonomy thresholds
  - `explainability.js` - Attribution generation
  - `document-processor.js` - PDF parsing

---

## Data Flow

### Loan Submission Flow
```
1. User submits form → Frontend
2. Frontend POST /api/loans → Backend
3. Backend calls AI Module:
   a. semanticAnalyzer.performSemanticEvaluation()
   b. lmaCompliance.evaluateLMACompliance()
   c. euTaxonomy.assessEUTaxonomy()
   d. explainability.generateExplanation()
4. Backend stores result in SQLite
5. Backend returns JSON → Frontend
6. Frontend displays score + badges + reasoning
```

### Semantic Analysis Flow
```
Input: "50 MW solar photovoltaic plant"
                    │
                    ▼
┌─────────────────────────────────────┐
│          DeepSeek API               │
│    (or local fallback if no key)    │
│                                     │
│    Input → [768-dim embedding]      │
└─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│     Compare against 9 reference     │
│     category embeddings             │
│                                     │
│     cosine_similarity(input, ref)   │
└─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│     Top match: "Renewable Energy"   │
│     Similarity: 0.87 (87%)          │
│     Score contribution: +17 pts     │
└─────────────────────────────────────┘
```

---

## Database Schema

### loans
```sql
CREATE TABLE loans (
  id INTEGER PRIMARY KEY,
  applicant_name TEXT,
  amount REAL,
  purpose TEXT,
  green_score INTEGER,
  risk_score INTEGER,
  recommendation TEXT,
  semantic_category TEXT,
  lma_compliant INTEGER,
  eu_taxonomy_eligible INTEGER,
  processing_time_ms INTEGER,
  reasoning TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### audit_log
```sql
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY,
  loan_id INTEGER,
  action TEXT,
  actor TEXT,
  details TEXT,
  result_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### processing_benchmarks
```sql
CREATE TABLE processing_benchmarks (
  id INTEGER PRIMARY KEY,
  loan_id INTEGER,
  total_time_ms INTEGER,
  semantic_analysis_ms INTEGER,
  lma_compliance_ms INTEGER,
  eu_taxonomy_ms INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## AI Scoring Algorithm

### Final Score Composition
```
Final Green Score = Σ(
  Semantic Alignment     × 0.30  (max 30 pts)
  Quantified Impact      × 0.25  (max 25 pts)
  Regulatory Compliance  × 0.25  (max 25 pts)
  Certification Bonus    × 0.10  (max 10 pts)
  Risk Deductions        × 0.10  (max -20 pts)
)
```

### Semantic Categories
1. Renewable Energy Production
2. Energy Efficiency
3. Clean Transportation
4. Green Buildings
5. Sustainable Water Management
6. Pollution Prevention
7. Circular Economy
8. Biodiversity Conservation
9. Climate Adaptation

---

## Deployment Modes

### Development
```bash
# Two terminals needed
node backend/server.js    # API
cd frontend && npm run dev  # UI with hot-reload
```

### Production (Single Server)
```bash
cd frontend && npm run build
# Configure Express to serve frontend/dist
node backend/server.js
```

### Electron (Desktop App)
```bash
cd frontend && npm run electron
```
