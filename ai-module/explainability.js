/**
 * Explainability Module
 * Provides transparent, auditable explanations for AI decisions
 * Implements feature attribution, decision audit trails, and natural language explanations
 */

/**
 * Feature Attribution Categories
 * Each category contributes to the final score with tracked weights
 */
const ATTRIBUTION_CATEGORIES = {
    semantic_alignment: {
        name: 'Semantic Alignment',
        description: 'How well the project description matches known green project categories',
        max_contribution: 35
    },
    quantified_impact: {
        name: 'Quantified Impact',
        description: 'Presence of specific, measurable environmental metrics',
        max_contribution: 25
    },
    regulatory_compliance: {
        name: 'Regulatory Compliance',
        description: 'Alignment with LMA GLP and EU Taxonomy requirements',
        max_contribution: 25
    },
    risk_factors: {
        name: 'Risk Factors',
        description: 'Greenwashing indicators and project risks',
        max_contribution: -15,
        is_negative: true
    }
};

/**
 * Generate feature attribution breakdown for a score
 * Shows exactly how much each factor contributed
 */
function generateAttribution(evaluationResult) {
    const attributions = [];
    let totalPositive = 0;
    let totalNegative = 0;

    // 1. Semantic Alignment Attribution
    const semanticScore = evaluationResult.semantic?.semantic_score || 0;
    const semanticContribution = Math.round((semanticScore / 100) * ATTRIBUTION_CATEGORIES.semantic_alignment.max_contribution);
    attributions.push({
        category: 'semantic_alignment',
        name: ATTRIBUTION_CATEGORIES.semantic_alignment.name,
        score_contribution: semanticContribution,
        max_possible: ATTRIBUTION_CATEGORIES.semantic_alignment.max_contribution,
        percentage: Math.round((semanticContribution / ATTRIBUTION_CATEGORIES.semantic_alignment.max_contribution) * 100),
        details: evaluationResult.semantic?.primary_category
            ? `Best match: ${formatCategoryName(evaluationResult.semantic.primary_category.category)} (${Math.round(evaluationResult.semantic.primary_category.similarity * 100)}% similarity)`
            : 'No strong category match found',
        evidence: evaluationResult.semantic?.primary_category?.category || null
    });
    totalPositive += semanticContribution;

    // 2. Quantified Impact Attribution
    const metrics = evaluationResult.semantic?.quantified_metrics || {};
    const metricCount = Object.keys(metrics).length;
    const specificityBonus = evaluationResult.semantic?.specificity_bonus || 0;
    const quantifiedContribution = Math.min(
        Math.round((metricCount / 4) * ATTRIBUTION_CATEGORIES.quantified_impact.max_contribution) + Math.round(specificityBonus * 0.5),
        ATTRIBUTION_CATEGORIES.quantified_impact.max_contribution
    );

    const metricDetails = [];
    if (metrics.energy_capacity) metricDetails.push(`Energy: ${metrics.energy_capacity.value} ${metrics.energy_capacity.unit}`);
    if (metrics.carbon_reduction) metricDetails.push(`CO2: ${metrics.carbon_reduction.value} ${metrics.carbon_reduction.unit}`);
    if (metrics.timeline) metricDetails.push(`Timeline: ${metrics.timeline.value} ${metrics.timeline.unit}`);
    if (metrics.jobs_created) metricDetails.push(`Jobs: ${metrics.jobs_created}`);

    attributions.push({
        category: 'quantified_impact',
        name: ATTRIBUTION_CATEGORIES.quantified_impact.name,
        score_contribution: quantifiedContribution,
        max_possible: ATTRIBUTION_CATEGORIES.quantified_impact.max_contribution,
        percentage: Math.round((quantifiedContribution / ATTRIBUTION_CATEGORIES.quantified_impact.max_contribution) * 100),
        details: metricDetails.length > 0
            ? `Found: ${metricDetails.join(', ')}`
            : 'No quantified environmental metrics found - consider adding specific numbers',
        evidence: metricDetails
    });
    totalPositive += quantifiedContribution;

    // 3. Regulatory Compliance Attribution
    const lmaScore = evaluationResult.lma_compliance?.score || 0;
    const euScore = evaluationResult.eu_taxonomy?.score || 0;
    const complianceAvg = (lmaScore + euScore) / 2;
    const complianceContribution = Math.round((complianceAvg / 100) * ATTRIBUTION_CATEGORIES.regulatory_compliance.max_contribution);

    const complianceDetails = [];
    if (evaluationResult.lma_compliance?.compliant) complianceDetails.push('LMA GLP Compliant');
    if (evaluationResult.eu_taxonomy?.eligible) complianceDetails.push('EU Taxonomy Aligned');

    attributions.push({
        category: 'regulatory_compliance',
        name: ATTRIBUTION_CATEGORIES.regulatory_compliance.name,
        score_contribution: complianceContribution,
        max_possible: ATTRIBUTION_CATEGORIES.regulatory_compliance.max_contribution,
        percentage: Math.round((complianceContribution / ATTRIBUTION_CATEGORIES.regulatory_compliance.max_contribution) * 100),
        details: complianceDetails.length > 0
            ? complianceDetails.join(', ')
            : 'Does not meet compliance thresholds',
        evidence: {
            lma_score: lmaScore,
            eu_score: euScore
        }
    });
    totalPositive += complianceContribution;

    // 4. Risk Factors (Negative Attribution)
    const greenwashingRisk = evaluationResult.greenwashing_risk?.risk_score || 0;
    const riskPenalty = Math.round((greenwashingRisk / 100) * Math.abs(ATTRIBUTION_CATEGORIES.risk_factors.max_contribution));

    const riskFlags = evaluationResult.greenwashing_risk?.flags || [];
    const riskDetails = riskFlags.slice(0, 3).map(f => f.flag || f).join('; ');

    attributions.push({
        category: 'risk_factors',
        name: ATTRIBUTION_CATEGORIES.risk_factors.name,
        score_contribution: -riskPenalty,
        max_possible: ATTRIBUTION_CATEGORIES.risk_factors.max_contribution,
        percentage: Math.round((riskPenalty / Math.abs(ATTRIBUTION_CATEGORIES.risk_factors.max_contribution)) * 100),
        details: riskDetails || 'No significant risk factors detected',
        evidence: riskFlags,
        is_negative: true
    });
    totalNegative += riskPenalty;

    // Calculate final attributed score
    const attributedTotal = totalPositive - totalNegative;

    return {
        attributions,
        total_positive: totalPositive,
        total_negative: totalNegative,
        attributed_score: Math.max(0, Math.min(100, attributedTotal + 15)), // Base score of 15
        attribution_coverage: Math.round((Math.abs(totalPositive) + Math.abs(totalNegative)) / 100 * 100)
    };
}

/**
 * Generate natural language explanation of the decision
 * Now uses gap_analysis for specific, actionable explanations
 */
function generateNaturalLanguageExplanation(evaluationResult, attribution) {
    const parts = [];
    const score = evaluationResult.green_score || attribution.attributed_score;
    const lmaGaps = evaluationResult.lma_compliance?.gap_analysis?.gaps || [];
    const euGaps = evaluationResult.eu_taxonomy?.gap_analysis?.gaps || [];

    // -- SPECIFIC OPENING based on what's actually wrong --
    if (score >= 75 && lmaGaps.length === 0) {
        parts.push(`APPROVED: This project scores ${score}/100 and meets green financing requirements.`);
    } else if (score >= 50) {
        const blockingIssues = lmaGaps.filter(g => g.status === 'FAIL').map(g => g.pillar);
        if (blockingIssues.length > 0) {
            parts.push(`REVIEW REQUIRED: Score ${score}/100. Key issues: ${blockingIssues.join(', ')}.`);
        } else {
            parts.push(`CONDITIONAL: Score ${score}/100. Minor gaps need addressing.`);
        }
    } else {
        const primaryBlocker = evaluationResult.lma_compliance?.gap_analysis?.primary_blocker || lmaGaps[0];
        if (primaryBlocker) {
            parts.push(`BELOW THRESHOLD: Score ${score}/100. Primary issue: ${primaryBlocker.issue || primaryBlocker.pillar || 'Multiple gaps identified'}.`);
        } else {
            parts.push(`BELOW THRESHOLD: Score ${score}/100. Multiple compliance gaps identified.`);
        }
    }

    // -- EXPLAIN LMA GLP GAPS SPECIFICALLY --
    if (lmaGaps.length > 0 && !evaluationResult.lma_compliance?.compliant) {
        parts.push(`\n\n**LMA Green Loan Principles Issues:**`);
        for (const gap of lmaGaps.slice(0, 3)) {
            parts.push(`• ${gap.pillar}: ${gap.issue}`);
            if (gap.fix) {
                parts.push(`  → Fix: ${gap.fix}`);
            }
        }
    }

    // -- EXPLAIN EU TAXONOMY GAPS SPECIFICALLY --  
    if (euGaps.length > 0 && !evaluationResult.eu_taxonomy?.eligible) {
        parts.push(`\n\n**EU Taxonomy Issues:**`);
        for (const gap of euGaps.slice(0, 2)) {
            parts.push(`• ${gap.criterion}: ${gap.issue}`);
            if (gap.fix) {
                parts.push(`  → Fix: ${gap.fix}`);
            }
        }
    }

    // -- WHAT'S WORKING (brief) --
    const lmaStrengths = evaluationResult.lma_compliance?.gap_analysis?.strengths || [];
    const euStrengths = evaluationResult.eu_taxonomy?.gap_analysis?.strengths || [];
    if (lmaStrengths.length > 0 || euStrengths.length > 0) {
        const allStrengths = [...lmaStrengths, ...euStrengths].slice(0, 2);
        if (allStrengths.length > 0) {
            parts.push(`\n\n**Strengths:** ${allStrengths.map(s => s.pillar || s.criterion).join(', ')} criteria met.`);
        }
    }

    // -- QUANTIFIED METRICS FOUND --
    const metrics = evaluationResult.semantic?.quantified_metrics || {};
    const metricCount = Object.keys(metrics).length;
    if (metricCount > 0) {
        const metricList = [];
        if (metrics.energy_capacity) metricList.push(`${metrics.energy_capacity.value} ${metrics.energy_capacity.unit}`);
        if (metrics.carbon_reduction) metricList.push(`${metrics.carbon_reduction.value} ${metrics.carbon_reduction.unit} CO2`);
        if (metrics.energy_generated) metricList.push(`${metrics.energy_generated.value} ${metrics.energy_generated.unit}/year`);
        parts.push(`\n\n**Metrics detected:** ${metricList.join(', ')}.`);
    } else {
        parts.push(`\n\n**Missing metrics:** No quantified environmental data found. Add specific numbers (e.g., "50 MW capacity", "43,800 tonnes CO2 avoided").`);
    }

    // -- GREENWASHING RISK --
    const riskLevel = evaluationResult.greenwashing_risk?.risk_level;
    const riskFlags = evaluationResult.greenwashing_risk?.flags || [];
    if (riskLevel === 'HIGH') {
        parts.push(`\n\n⚠️ **GREENWASHING RISK HIGH:** ${riskFlags.slice(0, 2).map(f => f.flag).join('; ')}. Third-party verification required.`);
    } else if (riskLevel === 'MEDIUM' && riskFlags.length > 0) {
        parts.push(`\n\n**Credibility concern:** ${riskFlags[0].flag}. Consider adding verification.`);
    }

    return parts.join('\n');
}

/**
 * Create full audit trail entry for a decision
 */
function createAuditTrailEntry(application, evaluationResult, attribution) {
    return {
        timestamp: new Date().toISOString(),
        application_id: application.id || null,
        applicant: application.applicant_name || 'Unknown',
        amount: application.amount || 0,

        // Decision
        final_score: evaluationResult.green_score,
        recommendation: evaluationResult.recommendation,
        risk_score: evaluationResult.risk_score,

        // Attribution breakdown
        attribution_summary: attribution.attributions.map(a => ({
            factor: a.name,
            contribution: a.score_contribution,
            max: a.max_possible
        })),

        // Evidence chain
        evidence: {
            primary_category: evaluationResult.semantic?.primary_category?.category,
            semantic_similarity: evaluationResult.semantic?.primary_category?.similarity,
            lma_compliant: evaluationResult.lma_compliance?.compliant,
            eu_eligible: evaluationResult.eu_taxonomy?.eligible,
            greenwashing_flags: evaluationResult.greenwashing_risk?.flags?.length || 0,
            quantified_metrics_count: Object.keys(evaluationResult.semantic?.quantified_metrics || {}).length
        },

        // Model info
        analysis_source: evaluationResult.analysis_source || 'hybrid',
        confidence_level: evaluationResult.confidence_level || 'medium',
        processing_time_ms: evaluationResult.processing_time_ms || null,

        // For reproducibility
        input_hash: hashInput(application),
        model_version: '2.0.0-semantic'
    };
}

/**
 * Generate improvement suggestions based on attribution gaps
 */
function generateImprovementSuggestions(attribution, evaluationResult) {
    const suggestions = [];

    for (const attr of attribution.attributions) {
        if (attr.is_negative) continue;

        const gap = attr.max_possible - attr.score_contribution;
        if (gap > 5) {
            switch (attr.category) {
                case 'semantic_alignment':
                    suggestions.push({
                        priority: gap > 15 ? 'HIGH' : 'MEDIUM',
                        category: attr.name,
                        suggestion: 'Revise project description to clearly articulate environmental objectives and align with recognized green project categories (renewable energy, efficiency, clean transport, etc.)',
                        potential_gain: gap
                    });
                    break;
                case 'quantified_impact':
                    suggestions.push({
                        priority: 'HIGH',
                        category: attr.name,
                        suggestion: 'Add specific, quantified environmental metrics: installed capacity (MW/kW), expected CO2 reduction (tonnes/year), energy savings (kWh), or jobs created',
                        potential_gain: gap
                    });
                    break;
                case 'regulatory_compliance':
                    if (!evaluationResult.lma_compliance?.compliant) {
                        suggestions.push({
                            priority: 'MEDIUM',
                            category: attr.name,
                            suggestion: 'Strengthen alignment with LMA Green Loan Principles: clearly define use of proceeds, project selection criteria, and reporting mechanisms',
                            potential_gain: Math.round(gap / 2)
                        });
                    }
                    if (!evaluationResult.eu_taxonomy?.eligible) {
                        suggestions.push({
                            priority: 'MEDIUM',
                            category: attr.name,
                            suggestion: 'Align project with EU Taxonomy environmental objectives and ensure Technical Screening Criteria are met',
                            potential_gain: Math.round(gap / 2)
                        });
                    }
                    break;
            }
        }
    }

    // Risk reduction suggestions
    const riskAttr = attribution.attributions.find(a => a.category === 'risk_factors');
    if (riskAttr && Math.abs(riskAttr.score_contribution) > 5) {
        suggestions.push({
            priority: 'HIGH',
            category: 'Risk Reduction',
            suggestion: 'Address greenwashing concerns: replace vague claims with specific commitments, provide third-party verification, and remove any fossil fuel associations',
            potential_gain: Math.abs(riskAttr.score_contribution)
        });
    }

    return suggestions.sort((a, b) => b.potential_gain - a.potential_gain);
}

/**
 * Helper: Format category name for display
 */
function formatCategoryName(category) {
    return category
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Helper: Create simple hash of input for audit trail
 */
function hashInput(application) {
    const str = JSON.stringify({
        name: application.applicant_name,
        amount: application.amount,
        purpose: application.purpose?.substring(0, 100)
    });

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

module.exports = {
    generateAttribution,
    generateNaturalLanguageExplanation,
    createAuditTrailEntry,
    generateImprovementSuggestions,
    ATTRIBUTION_CATEGORIES
};
