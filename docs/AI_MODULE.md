# AI Module Documentation

## Overview

The AI Module is the core intelligence of VerdeScore, responsible for:
- Semantic understanding of loan purposes
- Regulatory compliance checking
- Explainable score generation

## Components

### 1. Semantic Analyzer (`semantic-analyzer.js`)

**Purpose:** Understands the meaning of project descriptions, not just keywords.

**Key Functions:**

```javascript
// Main entry point
performSemanticEvaluation(application) → {
  semantic_score: number,
  primary_category: string,
  quantified_metrics: object,
  analysis_method: string
}
```

**How It Works:**
1. Gets embedding vector for input text (via DeepSeek API or local)
2. Compares against 9 pre-defined category reference embeddings
3. Uses cosine similarity to find best match
4. Extracts quantified metrics using regex patterns

**Category References:**
```javascript
const GREEN_CATEGORY_REFERENCES = {
  "Renewable Energy Production": 
    "Solar and wind power generation, photovoltaic installations...",
  "Energy Efficiency": 
    "Building retrofits for energy reduction, LED lighting...",
  // ... 7 more categories
};
```

---

### 2. LMA Compliance (`lma-compliance.js`)

**Purpose:** Evaluates loans against LMA Green Loan Principles.

**Four Components Checked:**
1. **Use of Proceeds** - Is the use clearly defined for green purposes?
2. **Project Evaluation & Selection** - Does the borrower have green expertise?
3. **Management of Proceeds** - Are funds tracked separately?
4. **Reporting** - Is impact reporting planned?

**Output:**
```javascript
{
  lma_total_score: 77,
  is_compliant: true,
  component_scores: {
    use_of_proceeds: 82,
    project_evaluation: 70,
    management_of_proceeds: 75,
    reporting: 80
  },
  recommendations: [...]
}
```

---

### 3. EU Taxonomy (`eu-taxonomy.js`)

**Purpose:** Checks against real EU Taxonomy Technical Screening Criteria.

**Criteria by Category:**

| Activity | Threshold | Criteria |
|----------|-----------|----------|
| Solar/Wind | <100g CO2e/kWh | Lifecycle emissions |
| Buildings | ≥30% reduction | OR top 15% of stock |
| Transport | Zero tailpipe | OR <50g CO2/km |
| Energy Storage | Any capacity | Must support renewables |

**Output:**
```javascript
{
  eu_score: 72,
  is_taxonomy_aligned: true,
  climate_objective: "Climate Change Mitigation",
  tsc_assessment: {
    meets_criteria: true,
    dnsh_flags: [],
    minimum_safeguards: "pending"
  }
}
```

---

### 4. Explainability (`explainability.js`)

**Purpose:** Generates human-readable explanations for scores.

**Attribution Breakdown:**
```javascript
{
  semantic_contribution: 17,
  impact_contribution: 25,
  compliance_contribution: 14,
  certification_bonus: 10,
  risk_deduction: -5
}
```

**Natural Language Generation:**
```javascript
generateExplanation(analysis) → 
"This application demonstrates strong alignment with Renewable Energy 
activities (87% semantic match). Quantified claims include 50 MW 
capacity and 43,800 tonnes CO2 reduction, meeting EU Taxonomy 
thresholds for solar installations..."
```

---

### 5. Document Processor (`document-processor.js`)

**Purpose:** Extracts and validates evidence from uploaded PDFs.

**Pipeline:**
```
PDF Buffer → pdf-parse → Text Extraction → 
Semantic Analysis → Evidence Detection → 
Metric Extraction → Validation Report
```

**Evidence Keywords Detected:**
- Certifications: ISO 14001, LEED, BREEAM
- Renewable: solar, wind, photovoltaic
- Efficiency: energy reduction, LED, insulation
- Standards: EU Taxonomy, GHG Protocol

---

## Fallback Behavior

If `DeepSeek_API_KEY` is not set:
1. **Embeddings**: Uses simplified local keyword analysis
2. **Chat completions**: Uses rule-based scoring
3. **Performance**: Faster but less nuanced

```javascript
// Example local fallback
function localSemanticScore(purpose) {
  const keywords = extractKeywords(purpose);
  return keywords.filter(k => GREEN_TERMS.includes(k)).length * 10;
}
```

---

## Configuration

### Environment Variables
```env
DeepSeek_API_KEY=your_key_here    # Optional, enables enhanced analysis
```

### Tuning Parameters (`semantic-analyzer.js`)
```javascript
const SIMILARITY_THRESHOLD = 0.3;  // Minimum to count as match
const SPECIFICITY_BONUS_MAX = 25;  // Max points for quantified claims
const CERTIFICATION_BONUS = 10;    // Bonus for recognized certifications
```

---

## Testing

### Unit Test
```bash
node tests/test_ai_direct.js
```

### Expected Output
```
Testing AI Module Direct...
Input: 50 MW solar photovoltaic power plant...

Results:
- Green Score: 66-72
- Semantic Category: Renewable Energy Production
- LMA Compliant: true
- Processing Time: 10-50ms
```
