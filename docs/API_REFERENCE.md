# API Reference

## Base URL
```
http://localhost:3001/api
```

## Authentication
Currently no authentication required. Production deployments should implement API key or JWT authentication.

---

## Endpoints

### GET /info
Returns API version and status.

**Response:**
```json
{
  "name": "VerdeScore API",
  "version": "2.0.0-semantic",
  "features": ["semantic-analysis", "lma-compliance", "eu-taxonomy", "explainability"]
}
```

---

### POST /loans
Submit a new loan application for AI evaluation.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| applicant | string | Yes | Organization/applicant name |
| amount | number | Yes | Loan amount in USD |
| purpose | string | Yes | Project description (detailed = better scores) |
| location | string | No | Project location |
| projectType | string | No | e.g., "Solar Energy", "Wind Energy" |
| capacity | number | No | Project capacity (MW) |
| co2Reduction | number | No | Estimated CO2 reduction (tonnes/year) |

**Example Request:**
```json
{
  "applicant": "SolarTech GmbH",
  "amount": 5000000,
  "purpose": "Installation of 50 MW solar photovoltaic power plant. Expected to generate 87,600 MWh annually, reducing 43,800 tonnes CO2 per year. LEED Platinum certified.",
  "location": "Germany",
  "capacity": 50,
  "co2Reduction": 43800
}
```

**Response:**
```json
{
  "message": "success",
  "data": {
    "id": 1,
    "applicant_name": "SolarTech GmbH",
    "amount": 5000000,
    "green_score": 72,
    "risk_score": 28,
    "recommendation": "APPROVE",
    "semantic_category": "Renewable Energy Production",
    "lma_compliant": 1,
    "eu_taxonomy_eligible": 1,
    "processing_time_ms": 13,
    "reasoning": "This solar project scores highly because..."
  }
}
```

---

### GET /loans
List all loan applications with their scores.

**Response:**
```json
{
  "message": "success",
  "data": [
    {
      "id": 1,
      "applicant_name": "SolarTech GmbH",
      "amount": 5000000,
      "green_score": 72,
      "risk_score": 28,
      "status": "PENDING",
      "created_at": "2026-01-14T12:00:00.000Z"
    }
  ]
}
```

---

### GET /loans/:id/explainability
Get detailed attribution breakdown for a loan's score.

**Response:**
```json
{
  "message": "success",
  "data": {
    "loan_id": 1,
    "final_score": 72,
    "attribution": {
      "semantic_alignment": 17,
      "quantified_impact": 25,
      "regulatory_compliance": 14,
      "risk_factors": -5,
      "certification_bonus": 10
    },
    "explanation": "This application shows strong green alignment...",
    "improvement_suggestions": [
      "Add third-party verification for +10 points",
      "Include lifecycle emissions data for +5 points"
    ]
  }
}
```

---

### GET /loans/:id/audit
Get full audit trail for regulatory compliance.

**Response:**
```json
{
  "message": "success",
  "data": {
    "loan_id": 1,
    "entries": [
      {
        "timestamp": "2026-01-14T12:00:00.000Z",
        "action": "LOAN_CREATED",
        "actor": "AI Semantic Analyzer",
        "details": "Initial green score computed",
        "result": { "green_score": 72 }
      }
    ]
  }
}
```

---

### POST /loans/:id/documents
Upload and analyze a PDF document for evidence extraction.

**Request:** `multipart/form-data`
| Field | Type | Description |
|-------|------|-------------|
| document | file | PDF file to analyze |

**Response:**
```json
{
  "message": "success",
  "data": {
    "document_length": 5000,
    "semantic_score": 75,
    "evidence_found": ["ISO 14001", "LEED Platinum", "renewable energy"],
    "metrics": {
      "energy_capacity": { "value": "50 MW", "confidence": 0.95 }
    }
  }
}
```

---

### GET /benchmarks
Get processing time statistics.

**Response:**
```json
{
  "message": "success",
  "data": {
    "total_processed": 150,
    "avg_processing_ms": 13,
    "min_processing_ms": 8,
    "max_processing_ms": 45,
    "total_manual_hours_saved": 14400,
    "efficiency_multiple": "66,461x"
  }
}
```

---

### GET /team
List team members.

### POST /team/invite
Invite a new team member.

### DELETE /team/:id
Remove a team member.

---

## Error Responses

All errors return:
```json
{
  "error": "Error message description"
}
```

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |
