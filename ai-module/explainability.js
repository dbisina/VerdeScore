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
 * Provides intelligent, strategic analysis beyond just scores - helps users understand WHY and WHAT TO DO
 */
function generateNaturalLanguageExplanation(evaluationResult, attribution) {
    const parts = [];
    const score = evaluationResult.green_score || attribution.attributed_score;
    const riskScore = evaluationResult.risk_score || 0;
    const lmaResult = evaluationResult.lma_compliance || {};
    const euResult = evaluationResult.eu_taxonomy || {};
    const semantic = evaluationResult.semantic || {};
    const lmaGaps = lmaResult.gap_analysis?.gaps || [];
    const euGaps = euResult.gap_analysis?.gaps || [];
    const lmaStrengths = lmaResult.gap_analysis?.strengths || [];
    const euStrengths = euResult.gap_analysis?.strengths || [];

    // --- STRATEGIC ASSESSMENT OPENING ---
    const lmaCompliant = lmaResult.glp_compliant || lmaResult.compliant;
    const euAligned = euResult.eu_taxonomy_eligible || euResult.eligible;
    const category = semantic.primary_category?.category?.replace(/_/g, ' ') || 'unclassified project';

    if (score >= 80 && lmaCompliant && euAligned) {
        parts.push(`**STRONG CANDIDATE** for green financing. This ${category} demonstrates comprehensive alignment with both LMA Green Loan Principles and EU Taxonomy criteria.`);
    } else if (score >= 70 && lmaCompliant) {
        parts.push(`**APPROVABLE** with conditions. This ${category} meets LMA GLP requirements but has ${euAligned ? 'solid' : 'gaps in'} EU Taxonomy alignment. ${euAligned ? '' : 'Consider if EU disclosure compliance is required for your portfolio.'}`);
    } else if (score >= 50) {
        const failedPillars = lmaGaps.filter(g => g.status === 'FAIL').map(g => g.pillar);
        if (failedPillars.length > 0) {
            parts.push(`**CONDITIONAL APPROVAL** possible. This ${category} shows green intent but fails ${failedPillars.length} LMA pillar(s): **${failedPillars.join(', ')}**. Address these gaps before proceeding.`);
        } else {
            parts.push(`**NEEDS ENHANCEMENT**. This ${category} has partial green characteristics but lacks the specificity required for confident approval under green financing standards.`);
        }
    } else {
        parts.push(`**NOT RECOMMENDED** for green loan classification. This application lacks sufficient green credentials. Score: ${score}/100.`);
    }

    // --- KEY INSIGHT: What's actually blocking approval ---
    const primaryIssue = lmaResult.gap_analysis?.primary_blocker ||
        euResult.gap_analysis?.primary_blocker;
    if (primaryIssue && !lmaCompliant) {
        parts.push(`\n\n**Primary Barrier:** ${primaryIssue.issue || primaryIssue}`);
    }

    // --- INTELLIGENT RECOMMENDATIONS (not just listing gaps) ---
    const recommendations = [];

    // Check Use of Proceeds alignment
    const useOfProceedsGap = lmaGaps.find(g => g.pillar === 'Use of Proceeds');
    if (useOfProceedsGap) {
        const matchedCats = lmaResult.eligible_categories || [];
        if (matchedCats.length === 0) {
            recommendations.push({
                priority: 'HIGH',
                title: 'Clarify Green Purpose',
                detail: `The project description doesn't clearly map to recognized green categories. Specify how this directly funds renewable energy, efficiency improvements, clean transport, or similar eligible activities.`
            });
        } else {
            recommendations.push({
                priority: 'MEDIUM',
                title: 'Strengthen Category Alignment',
                detail: `Project partially matches "${matchedCats[0]}" but needs stronger connection. Add project-specific details that demonstrate direct environmental benefit.`
            });
        }
    }

    // Check for quantification issues
    const projectEvalGap = lmaGaps.find(g => g.pillar === 'Project Evaluation');
    if (projectEvalGap) {
        const evidenceFound = lmaResult.components?.project_evaluation?.evidence_found || [];
        const evidenceMissing = lmaResult.components?.project_evaluation?.evidence_missing || [];

        if (evidenceFound.length === 0) {
            recommendations.push({
                priority: 'HIGH',
                title: 'Add Quantified Impact Metrics',
                detail: `No measurable environmental claims found. Include specific numbers: installed capacity (MW), annual CO2 reduction (tonnes), energy savings (kWh/year), or similar KPIs.`
            });
        } else if (evidenceMissing.length > 0) {
            recommendations.push({
                priority: 'MEDIUM',
                title: 'Complete Impact Quantification',
                detail: `Found ${evidenceFound.length} metric(s), but key data missing: ${evidenceMissing.slice(0, 2).join(', ')}. Adding these strengthens the business case.`
            });
        }
    }

    // EU Taxonomy specific insight
    if (!euAligned && euGaps.length > 0) {
        const dnshViolation = euGaps.find(g => g.criterion === 'Do No Significant Harm (DNSH)');
        const tscGap = euGaps.find(g => g.criterion?.includes('Technical Screening'));

        if (dnshViolation) {
            recommendations.push({
                priority: 'HIGH',
                title: 'Address DNSH Concern',
                detail: `EU Taxonomy requires demonstrating no significant harm to other environmental objectives. Issue: ${dnshViolation.detail?.split(';')[0] || 'Review project for harmful side effects'}.`
            });
        } else if (tscGap && tscGap.status === 'PARTIAL') {
            recommendations.push({
                priority: 'MEDIUM',
                title: 'Verify Technical Thresholds',
                detail: `Provide missing technical data for EU Taxonomy alignment (e.g., lifecycle emissions < 100g CO2e/kWh for energy projects). ${tscGap.issue}`
            });
        }
    }

    // Output recommendations
    if (recommendations.length > 0) {
        parts.push(`\n\n**Strategic Recommendations:**`);
        for (const rec of recommendations.slice(0, 3)) {
            parts.push(`\n• [${rec.priority}] **${rec.title}:** ${rec.detail}`);
        }
    }

    // --- WHAT'S WORKING (validation for the applicant) ---
    if (lmaStrengths.length > 0 || euStrengths.length > 0) {
        const strengths = [];
        for (const s of lmaStrengths) {
            strengths.push(s.pillar);
        }
        for (const s of euStrengths) {
            if (!strengths.includes(s.criterion)) strengths.push(s.criterion);
        }
        if (strengths.length > 0) {
            parts.push(`\n\n**Strengths:** ${strengths.slice(0, 3).join(', ')} requirements satisfied.`);
        }
    }

    // --- MARKET CONTEXT (intelligent insight) ---
    const metrics = semantic.quantified_metrics || {};
    if (metrics.energy_capacity?.value) {
        const capacity = metrics.energy_capacity.value;
        const unit = metrics.energy_capacity.unit?.toUpperCase() || 'MW';
        // Estimate annual generation and CO2 impact
        if (unit === 'MW' || unit === 'mw') {
            const annualMWh = capacity * 8760 * 0.25; // 25% capacity factor estimate
            const co2Avoided = annualMWh * 0.4; // ~400kg CO2 per MWh displaced
            parts.push(`\n\n**Estimated Impact:** ${capacity} ${unit} capacity → ~${Math.round(annualMWh / 1000)} GWh/year → ~${Math.round(co2Avoided / 1000)} tonnes CO2 avoided annually.`);
        }
    }

    // --- GREENWASHING RISK CONTEXT ---
    const riskLevel = evaluationResult.greenwashing_risk?.risk_level;
    const riskFlags = evaluationResult.greenwashing_risk?.flags || [];
    if (riskLevel === 'HIGH') {
        parts.push(`\n\n⚠️ **Credibility Alert:** High greenwashing risk detected. ${riskFlags[0]?.flag || 'Multiple vague claims require verification'}. Consider requesting third-party SPO or certification.`);
    } else if (riskLevel === 'MEDIUM' && riskFlags.length > 0) {
        parts.push(`\n\n**Note:** ${riskFlags[0]?.flag}. Supporting documentation recommended.`);
    }

    // --- APPROVAL PATHWAY ---
    if (!lmaCompliant && score >= 40) {
        const gapsToFix = lmaGaps.filter(g => g.status === 'FAIL').length;
        parts.push(`\n\n**Path to Approval:** Address ${gapsToFix} critical gap(s) listed above. Estimated score improvement: +${Math.min(30, gapsToFix * 15)} points possible.`);
    }

    return parts.join('');
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
