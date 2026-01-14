/**
 * LMA Green Loan Principles Compliance Module v2.0
 * 
 * Evaluates loans against the 4 core GLP components with:
 * - Evidence-based scoring (claims must have supporting metrics)
 * - SPO (Second Party Opinion) simulation
 * - Detailed factor breakdown
 * - Ongoing monitoring capability assessment
 */

// GLP Eligible Green Project Categories (per LMA Green Loan Principles 2023)
const GLP_ELIGIBLE_CATEGORIES = {
    renewable_energy: {
        keywords: ['solar', 'wind', 'hydro', 'geothermal', 'biomass', 'biogas', 'tidal', 'wave', 'renewable'],
        weight: 1.0,
        description: 'Renewable Energy',
        examples: ['Solar PV installation', 'Wind farm development', 'Hydroelectric power'],
        required_evidence: ['capacity_mw', 'annual_generation_mwh', 'co2_avoided_tonnes']
    },
    energy_efficiency: {
        keywords: ['efficiency', 'retrofit', 'insulation', 'led', 'smart grid', 'heat pump', 'hvac', 'building management'],
        weight: 0.95,
        description: 'Energy Efficiency',
        examples: ['Building HVAC upgrade', 'Industrial process efficiency', 'Smart metering'],
        required_evidence: ['baseline_consumption', 'projected_savings_percent', 'payback_years']
    },
    pollution_prevention: {
        keywords: ['emission', 'pollution', 'filter', 'scrubber', 'clean', 'carbon capture', 'ccs', 'air quality'],
        weight: 0.9,
        description: 'Pollution Prevention and Control',
        examples: ['Flue gas treatment', 'Carbon capture facility', 'Air quality monitoring'],
        required_evidence: ['emissions_baseline', 'emissions_target', 'reduction_percent']
    },
    sustainable_water: {
        keywords: ['water treatment', 'wastewater', 'desalination', 'irrigation', 'water conservation', 'water recycling'],
        weight: 0.9,
        description: 'Environmentally Sustainable Water Management',
        examples: ['Wastewater treatment plant', 'Water recycling system', 'Efficient irrigation'],
        required_evidence: ['water_volume_m3', 'treatment_capacity', 'reuse_percentage']
    },
    clean_transport: {
        keywords: ['electric vehicle', 'ev', 'charging', 'rail', 'public transport', 'bicycle', 'hydrogen', 'fleet electrification'],
        weight: 0.95,
        description: 'Clean Transportation',
        examples: ['EV charging network', 'Electric bus fleet', 'Rail electrification'],
        required_evidence: ['vehicles_count', 'emissions_avoided', 'passengers_served']
    },
    green_building: {
        keywords: ['leed', 'breeam', 'green building', 'net zero', 'passive house', 'sustainable construction', 'nzeb'],
        weight: 0.9,
        description: 'Green Buildings',
        examples: ['LEED Platinum office', 'BREEAM Outstanding residential', 'Net zero school'],
        required_evidence: ['certification_target', 'energy_intensity_kwh_m2', 'floor_area_m2']
    },
    biodiversity: {
        keywords: ['forest', 'reforestation', 'conservation', 'habitat', 'ecosystem', 'wildlife', 'afforestation'],
        weight: 0.85,
        description: 'Terrestrial and Aquatic Biodiversity Conservation',
        examples: ['Reforestation project', 'Wetland restoration', 'Marine protected area'],
        required_evidence: ['area_hectares', 'species_protected', 'carbon_sequestered']
    },
    circular_economy: {
        keywords: ['recycl', 'reuse', 'waste', 'circular', 'upcycl', 'compost', 'material recovery'],
        weight: 0.85,
        description: 'Circular Economy Products and Processes',
        examples: ['Recycling facility', 'Waste-to-energy plant', 'Composting operation'],
        required_evidence: ['waste_diverted_tonnes', 'recycling_rate_percent', 'energy_recovered_mwh']
    },
    sustainable_agriculture: {
        keywords: ['organic', 'sustainable agriculture', 'agroforestry', 'permaculture', 'regenerative', 'precision farming'],
        weight: 0.8,
        description: 'Sustainable Agriculture',
        examples: ['Organic farm conversion', 'Precision agriculture', 'Regenerative grazing'],
        required_evidence: ['land_area_hectares', 'yield_improvement', 'input_reduction']
    },
    climate_adaptation: {
        keywords: ['flood', 'drought', 'resilience', 'adaptation', 'climate risk', 'sea level', 'storm protection'],
        weight: 0.85,
        description: 'Climate Change Adaptation',
        examples: ['Flood defense system', 'Drought-resistant infrastructure', 'Coastal protection'],
        required_evidence: ['population_protected', 'assets_protected_value', 'risk_reduction_percent']
    }
};

// Enhanced greenwashing detection with severity and confidence
const GREENWASHING_INDICATORS = [
    { pattern: /carbon\s*neutral|net\s*zero/i, flag: 'Vague carbon claims without methodology', severity: 'medium', false_positive_check: /verified|certified|science.based/i },
    { pattern: /eco[\s-]?friendly|green|sustainable/i, flag: 'Generic environmental buzzwords without specifics', severity: 'low', false_positive_check: /certification|standard|measurement/i },
    { pattern: /offset|carbon\s*credit/i, flag: 'Reliance on offsets vs direct emission reduction', severity: 'medium', false_positive_check: /additionally|verified|gold\s*standard/i },
    { pattern: /coal|oil|gas|fossil|diesel|petroleum/i, flag: 'Fossil fuel involvement detected', severity: 'high', false_positive_check: /phase[\s-]?out|replacement|transition\s*from/i },
    { pattern: /will\s+be|plan\s+to|intend|commit|future/i, flag: 'Future commitments vs current action', severity: 'low', false_positive_check: /timeline|milestone|binding/i },
    { pattern: /partial|some|portion|partly/i, flag: 'Partial green allocation unclear', severity: 'medium', false_positive_check: /[\d]+\s*%|ring[\s-]?fenced/i },
    { pattern: /(?<!third[\s-]?)(?<!external[\s-]?)(?<!independent[\s-]?)claim/i, flag: 'Unverified claims without third-party validation', severity: 'low' }
];

/**
 * Evaluate loan against LMA Green Loan Principles
 */
function evaluateLMACompliance(application) {
    const purpose = (application.purpose || '').toLowerCase();
    const amount = application.amount || 0;

    // 1. USE OF PROCEEDS - Is the loan for an eligible green project?
    const useOfProceeds = evaluateUseOfProceeds(purpose);

    // 2. PROJECT EVALUATION - Are environmental objectives clearly stated with evidence?
    const projectEvaluation = evaluateProjectSelection(application);

    // 3. MANAGEMENT OF PROCEEDS - Can funds be tracked appropriately?
    const managementOfProceeds = evaluateManagementOfProceeds(application);

    // 4. REPORTING - Are impact metrics quantifiable and verifiable?
    const reporting = evaluateReportingCapability(application);

    // Calculate overall GLP score with evidence-based weighting
    const evidenceMultiplier = projectEvaluation.evidence_strength;

    const rawScore = Math.round(
        (useOfProceeds.score * 0.30) +
        (projectEvaluation.score * 0.30) +
        (managementOfProceeds.score * 0.20) +
        (reporting.score * 0.20)
    );

    // Apply evidence multiplier (rewards quantified claims)
    const adjustedScore = Math.round(rawScore * (0.7 + (evidenceMultiplier * 0.3)));

    // Greenwashing risk assessment with enhanced detection
    const greenwashingRisk = detectGreenwashing(purpose);

    // Final compliance determination
    const glpCompliant = adjustedScore >= 70 && greenwashingRisk.risk_level !== 'HIGH';

    // SPO simulation score
    const spoSimulation = simulateSPOAssessment(useOfProceeds, projectEvaluation, reporting, greenwashingRisk);

    return {
        overall_glp_score: adjustedScore,
        raw_score: rawScore,
        evidence_multiplier: evidenceMultiplier,
        glp_compliant: glpCompliant,
        components: {
            use_of_proceeds: useOfProceeds,
            project_evaluation: projectEvaluation,
            management_of_proceeds: managementOfProceeds,
            reporting: reporting
        },
        greenwashing_risk: greenwashingRisk,
        eligible_categories: useOfProceeds.matched_categories,
        spo_simulation: spoSimulation,
        monitoring_capability: assessMonitoringCapability(projectEvaluation, reporting),
        // NEW: Explicit gap analysis explaining non-compliance
        gap_analysis: buildGapAnalysis(useOfProceeds, projectEvaluation, managementOfProceeds, reporting, greenwashingRisk, glpCompliant)
    };
}

function evaluateUseOfProceeds(purpose) {
    let maxScore = 0;
    let matchedCategories = [];
    let reasoning = [];
    let requiredEvidence = [];

    for (const [category, config] of Object.entries(GLP_ELIGIBLE_CATEGORIES)) {
        for (const keyword of config.keywords) {
            if (purpose.includes(keyword)) {
                const weightedScore = config.weight * 100;
                if (weightedScore > maxScore) {
                    maxScore = weightedScore;
                }
                if (!matchedCategories.includes(config.description)) {
                    matchedCategories.push(config.description);
                    reasoning.push(`Matches GLP category: ${config.description}`);
                    requiredEvidence = requiredEvidence.concat(config.required_evidence);
                }
                break; // Only count category once
            }
        }
    }

    if (matchedCategories.length === 0) {
        reasoning.push('No clear alignment with GLP eligible green project categories');
        maxScore = 20;
    }

    // Bonus for multiple category alignment (indicates comprehensive green project)
    if (matchedCategories.length >= 2) {
        maxScore = Math.min(100, maxScore + 10);
        reasoning.push('Multi-objective green project identified');
    }

    return {
        score: Math.round(maxScore),
        matched_categories: matchedCategories,
        required_evidence: [...new Set(requiredEvidence)],
        reasoning: reasoning.join('; ')
    };
}

function evaluateProjectSelection(application) {
    let score = 40; // Base score
    let reasoning = [];
    let evidenceFound = [];
    let evidenceMissing = [];
    const purpose = application.purpose || '';

    // Check for quantified environmental objectives (critical for GLP)
    const quantificationChecks = [
        { pattern: /(\d+(?:\.\d+)?)\s*(mw|kw|gw|mwh|kwh|gwh)/i, name: 'Energy capacity/output', boost: 20 },
        { pattern: /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(tonne|ton|kg|mt)s?\s*(?:of\s+)?(?:co2|carbon|ghg)/i, name: 'GHG reduction', boost: 25 },
        { pattern: /(\d+(?:\.\d+)?)\s*%\s*(reduction|savings|improvement|efficiency)/i, name: 'Efficiency gains', boost: 15 },
        { pattern: /(\d+)\s*(month|year|day)s?\s*(timeline|duration|period|completion)/i, name: 'Project timeline', boost: 10 },
        { pattern: /(leed|breeam|iso\s*14001|green\s*bond\s*principles)/i, name: 'Certification reference', boost: 15 },
        { pattern: /(\d+(?:,\d{3})*)\s*(hectare|acre|m2|km2|square)/i, name: 'Project area', boost: 10 },
        { pattern: /(\d+)\s*(jobs?|employment|workers)/i, name: 'Job creation', boost: 5 }
    ];

    for (const check of quantificationChecks) {
        if (check.pattern.test(purpose)) {
            score += check.boost;
            evidenceFound.push(check.name);
            reasoning.push(`${check.name} quantified`);
        } else {
            evidenceMissing.push(check.name);
        }
    }

    // Check for location specificity
    if (application.location || /located|location|site|region|country/i.test(purpose)) {
        score += 5;
        evidenceFound.push('Project location');
    }

    // Check for baseline reference
    if (/baseline|current|existing|before|benchmark/i.test(purpose)) {
        score += 10;
        evidenceFound.push('Baseline reference');
        reasoning.push('Baseline for measurement established');
    }

    // Calculate evidence strength (0-1)
    const totalChecks = quantificationChecks.length + 2; // +2 for location and baseline
    const evidenceStrength = evidenceFound.length / totalChecks;

    if (evidenceFound.length === 0) {
        reasoning.push('No quantified environmental objectives found - critical gap for GLP compliance');
    }

    return {
        score: Math.min(100, score),
        evidence_strength: evidenceStrength,
        evidence_found: evidenceFound,
        evidence_missing: evidenceMissing.slice(0, 5), // Top 5 missing
        reasoning: reasoning.join('; ') || 'Basic project evaluation criteria assessed'
    };
}

function evaluateManagementOfProceeds(application) {
    let score = 55;
    let reasoning = [];
    const purpose = (application.purpose || '').toLowerCase();
    const amount = application.amount || 0;

    // Loan size considerations for tracking complexity
    if (amount > 0 && amount <= 5000000) {
        score += 20;
        reasoning.push('Loan size appropriate for straightforward tracking');
    } else if (amount > 5000000 && amount <= 20000000) {
        score += 15;
        reasoning.push('Medium-sized facility - standard tracking applicable');
    } else if (amount > 20000000) {
        score += 10;
        reasoning.push('Large facility - may require dedicated tracking account');
    }

    // Single-purpose vs multi-use indicators
    if (!/and|multiple|various|general/i.test(purpose)) {
        score += 15;
        reasoning.push('Single-purpose allocation simplifies proceeds tracking');
    } else {
        reasoning.push('Multi-purpose use indicated - ring-fencing recommended');
    }

    // Check for segregation/tracking mentions
    if (/segregat|ring[\s-]?fence|dedicated|separate\s*account/i.test(purpose)) {
        score += 10;
        reasoning.push('Proceeds segregation explicitly mentioned');
    }

    return {
        score: Math.min(100, score),
        reasoning: reasoning.join('; ') || 'Standard proceeds management expected'
    };
}

function evaluateReportingCapability(application) {
    let score = 35;
    let reasoning = [];
    let reportableMetrics = [];
    const purpose = application.purpose || '';

    // Check for reportable impact metrics
    const metricChecks = [
        { pattern: /co2|carbon|emission|ghg/i, metric: 'GHG emissions avoided/reduced', boost: 20 },
        { pattern: /energy|electricity|power|kwh|mwh/i, metric: 'Energy generated/saved', boost: 15 },
        { pattern: /water|wastewater|m3/i, metric: 'Water conserved/treated', boost: 10 },
        { pattern: /waste|recycl|divert/i, metric: 'Waste diverted/recycled', boost: 10 },
        { pattern: /job|employ|communit/i, metric: 'Social impact (jobs/community)', boost: 10 },
        { pattern: /biodiversity|species|habitat|hectare/i, metric: 'Biodiversity/land area', boost: 10 }
    ];

    for (const check of metricChecks) {
        if (check.pattern.test(purpose)) {
            score += check.boost;
            reportableMetrics.push(check.metric);
        }
    }

    // Third-party verification bonus
    if (/certif|audit|third[\s-]?party|external\s*review|verification|spo|verif/i.test(purpose)) {
        score += 15;
        reasoning.push('External verification referenced');
    }

    // Reporting frequency indicators
    if (/annual|quarterly|monthly|report/i.test(purpose)) {
        score += 5;
        reasoning.push('Reporting frequency indicated');
    }

    if (reportableMetrics.length > 0) {
        reasoning.push(`Reportable metrics: ${reportableMetrics.join(', ')}`);
    } else {
        reasoning.push('Limited quantifiable metrics for impact reporting');
    }

    return {
        score: Math.min(100, score),
        reportable_metrics: reportableMetrics,
        reasoning: reasoning.join('; ') || 'Basic impact reporting feasible'
    };
}

function detectGreenwashing(purpose) {
    let flags = [];
    let riskScore = 0;

    for (const indicator of GREENWASHING_INDICATORS) {
        if (indicator.pattern.test(purpose)) {
            // Check for false positive mitigators
            const isFalsePositive = indicator.false_positive_check && indicator.false_positive_check.test(purpose);

            if (!isFalsePositive) {
                flags.push({
                    flag: indicator.flag,
                    severity: indicator.severity
                });

                if (indicator.severity === 'high') riskScore += 30;
                else if (indicator.severity === 'medium') riskScore += 15;
                else riskScore += 5;
            }
        }
    }

    // Check for lack of specifics (major red flag)
    if (!/\d/.test(purpose)) {
        flags.push({
            flag: 'No quantified environmental claims',
            severity: 'medium'
        });
        riskScore += 20;
    }

    // Check for excessive vagueness
    const vagueTerms = (purpose.match(/sustainable|green|eco|clean|natural/gi) || []).length;
    const specificTerms = (purpose.match(/\d+\s*(mw|kw|tonne|ton|%|m2|hectare)/gi) || []).length;

    if (vagueTerms > 3 && specificTerms < 2) {
        flags.push({
            flag: 'High ratio of vague terms to specific metrics',
            severity: 'medium'
        });
        riskScore += 15;
    }

    const riskLevel = riskScore >= 50 ? 'HIGH' : riskScore >= 25 ? 'MEDIUM' : 'LOW';

    return {
        risk_score: Math.min(100, riskScore),
        risk_level: riskLevel,
        flags: flags,
        recommendation: riskLevel === 'HIGH'
            ? 'Manual review strongly recommended - multiple greenwashing indicators detected. Request supporting documentation.'
            : riskLevel === 'MEDIUM'
                ? 'Verify environmental claims with supporting documentation before approval.'
                : 'Low greenwashing risk - proceed with standard due diligence.'
    };
}

/**
 * Simulate Second Party Opinion (SPO) assessment
 */
function simulateSPOAssessment(useOfProceeds, projectEvaluation, reporting, greenwashingRisk) {
    let spoScore = 0;
    let assessment = [];

    // Use of Proceeds alignment
    if (useOfProceeds.matched_categories.length > 0) {
        spoScore += 30;
        assessment.push('Use of Proceeds aligns with GLP eligible categories');
    }

    // Evidence quality
    if (projectEvaluation.evidence_strength > 0.5) {
        spoScore += 25;
        assessment.push('Environmental objectives adequately quantified');
    } else if (projectEvaluation.evidence_strength > 0.25) {
        spoScore += 15;
        assessment.push('Partial quantification of objectives - improvement recommended');
    }

    // Reporting capability
    if (reporting.reportable_metrics.length >= 2) {
        spoScore += 20;
        assessment.push('Multiple impact metrics identified for reporting');
    }

    // Greenwashing risk deduction
    if (greenwashingRisk.risk_level === 'HIGH') {
        spoScore -= 30;
        assessment.push('Significant concerns about claim authenticity');
    } else if (greenwashingRisk.risk_level === 'MEDIUM') {
        spoScore -= 10;
        assessment.push('Minor concerns require clarification');
    } else {
        spoScore += 15;
        assessment.push('Claims appear credible');
    }

    const opinion = spoScore >= 70 ? 'POSITIVE' : spoScore >= 50 ? 'POSITIVE_WITH_RESERVATIONS' : 'NEGATIVE';

    return {
        simulated_score: Math.max(0, Math.min(100, spoScore)),
        opinion: opinion,
        assessment: assessment,
        disclaimer: 'This is a simulated SPO assessment. Actual SPO requires independent third-party review.'
    };
}

/**
 * Assess ongoing monitoring capability
 */
function assessMonitoringCapability(projectEvaluation, reporting) {
    const hasQuantifiedMetrics = projectEvaluation.evidence_found.length >= 2;
    const hasReportableMetrics = reporting.reportable_metrics.length >= 2;

    let capability = 'LOW';
    let recommendation = '';

    if (hasQuantifiedMetrics && hasReportableMetrics) {
        capability = 'HIGH';
        recommendation = 'Project has adequate metrics for ongoing impact monitoring';
    } else if (hasQuantifiedMetrics || hasReportableMetrics) {
        capability = 'MEDIUM';
        recommendation = 'Establish additional KPIs for comprehensive monitoring';
    } else {
        capability = 'LOW';
        recommendation = 'Define quantifiable environmental KPIs before loan disbursement';
    }

    return {
        capability,
        recommendation,
        suggested_kpis: projectEvaluation.evidence_missing.slice(0, 3)
    };
}

/**
 * Build detailed gap analysis explaining non-compliance
 */
function buildGapAnalysis(useOfProceeds, projectEvaluation, managementOfProceeds, reporting, greenwashingRisk, isCompliant) {
    const gaps = [];
    const strengths = [];

    // Pillar 1: Use of Proceeds
    if (useOfProceeds.score >= 70) {
        strengths.push({
            pillar: 'Use of Proceeds',
            status: 'PASS',
            detail: `Project aligns with ${useOfProceeds.matched_categories.length} GLP eligible categories: ${useOfProceeds.matched_categories.join(', ')}.`
        });
    } else if (useOfProceeds.matched_categories.length > 0) {
        gaps.push({
            pillar: 'Use of Proceeds',
            status: 'PARTIAL',
            score: useOfProceeds.score,
            issue: 'Weak alignment with LMA Green Loan Principles eligible categories.',
            detail: `Matched categories (${useOfProceeds.matched_categories.join(', ')}) but score is only ${useOfProceeds.score}/100.`,
            fix: 'Strengthen the connection to eligible green project categories by adding specific project scope details.'
        });
    } else {
        gaps.push({
            pillar: 'Use of Proceeds',
            status: 'FAIL',
            score: useOfProceeds.score,
            issue: 'No clear alignment with any LMA GLP eligible green project category.',
            detail: 'The project description does not match recognized categories like Renewable Energy, Energy Efficiency, Clean Transport, Green Buildings, etc.',
            fix: 'Clearly specify how proceeds will fund one of the 10 LMA GLP eligible categories (e.g., renewable energy installation, building retrofit, clean transport).'
        });
    }

    // Pillar 2: Project Evaluation & Selection
    if (projectEvaluation.score >= 70) {
        strengths.push({
            pillar: 'Project Evaluation',
            status: 'PASS',
            detail: `Environmental objectives are quantified with ${projectEvaluation.evidence_found.length} metrics: ${projectEvaluation.evidence_found.join(', ')}.`
        });
    } else {
        const missingEvidence = projectEvaluation.evidence_missing?.slice(0, 3) || ['specific metrics'];
        gaps.push({
            pillar: 'Project Evaluation',
            status: projectEvaluation.score >= 50 ? 'PARTIAL' : 'FAIL',
            score: projectEvaluation.score,
            issue: 'Environmental objectives are not adequately quantified.',
            detail: `Only ${projectEvaluation.evidence_found?.length || 0} metrics found. Missing: ${missingEvidence.join(', ')}.`,
            fix: `Add specific quantified metrics such as: ${missingEvidence.map(m => {
                const examples = {
                    'Energy capacity/output': 'e.g., "50 MW capacity" or "120,000 MWh/year"',
                    'GHG reduction': 'e.g., "43,800 tonnes CO2 avoided annually"',
                    'Efficiency gains': 'e.g., "30% energy reduction"',
                    'Project timeline': 'e.g., "24-month implementation"',
                    'Certification reference': 'e.g., "targeting LEED Platinum"'
                };
                return examples[m] || m;
            }).join('; ')}.`
        });
    }

    // Pillar 3: Management of Proceeds
    if (managementOfProceeds.score >= 70) {
        strengths.push({
            pillar: 'Management of Proceeds',
            status: 'PASS',
            detail: managementOfProceeds.reasoning
        });
    } else {
        gaps.push({
            pillar: 'Management of Proceeds',
            status: 'PARTIAL',
            score: managementOfProceeds.score,
            issue: 'Proceeds tracking and management approach unclear.',
            detail: 'No indication of how green loan proceeds will be ring-fenced or tracked.',
            fix: 'Add commitment to segregated account or dedicated tracking for green proceeds. State that funds will be ring-fenced for the specified green purpose.'
        });
    }

    // Pillar 4: Reporting
    if (reporting.score >= 70) {
        strengths.push({
            pillar: 'Reporting',
            status: 'PASS',
            detail: `${reporting.reportable_metrics?.length || 0} impact metrics identified for reporting: ${(reporting.reportable_metrics || []).join(', ')}.`
        });
    } else {
        gaps.push({
            pillar: 'Reporting',
            status: reporting.score >= 50 ? 'PARTIAL' : 'FAIL',
            score: reporting.score,
            issue: 'Insufficient impact reporting capability.',
            detail: `Only ${reporting.reportable_metrics?.length || 0} reportable metrics identified.`,
            fix: 'Include commitment to annual impact reporting with specific KPIs (e.g., MWh generated, tonnes CO2 avoided, jobs created). Consider third-party verification.'
        });
    }

    // Greenwashing concerns
    if (greenwashingRisk.risk_level === 'HIGH') {
        gaps.push({
            pillar: 'Credibility',
            status: 'FAIL',
            score: 100 - greenwashingRisk.risk_score,
            issue: 'High greenwashing risk detected.',
            detail: greenwashingRisk.flags.map(f => f.flag).join('; '),
            fix: 'Remove vague environmental claims. Replace with specific, verifiable metrics. Consider third-party certification or verification.'
        });
    } else if (greenwashingRisk.risk_level === 'MEDIUM') {
        gaps.push({
            pillar: 'Credibility',
            status: 'PARTIAL',
            score: 100 - greenwashingRisk.risk_score,
            issue: 'Moderate greenwashing risk.',
            detail: greenwashingRisk.flags.map(f => f.flag).join('; '),
            fix: 'Support environmental claims with specific evidence and consider external verification.'
        });
    }

    return {
        compliant: isCompliant,
        gap_count: gaps.length,
        strength_count: strengths.length,
        gaps: gaps,
        strengths: strengths,
        summary: isCompliant
            ? `Project meets LMA GLP requirements with ${strengths.length} pillars satisfied.`
            : `Project has ${gaps.length} gap(s) preventing LMA GLP compliance: ${gaps.map(g => g.pillar).join(', ')}.`,
        primary_blocker: gaps.length > 0 ? gaps[0] : null
    };
}

module.exports = {
    evaluateLMACompliance,
    GLP_ELIGIBLE_CATEGORIES,
    GREENWASHING_INDICATORS
};
