const axios = require('axios');
const { evaluateLMACompliance } = require('./lma-compliance');
const { evaluateEUTaxonomy } = require('./eu-taxonomy');
const { performSemanticEvaluation, extractQuantifiedMetrics } = require('./semantic-analyzer');
const { generateAttribution, generateNaturalLanguageExplanation, createAuditTrailEntry, generateImprovementSuggestions } = require('./explainability');

const DEEPSEEK_API_KEY = process.env.DeepSeek_API_KEY || '';
const API_URL = 'https://api.deepseek.com/v1/chat/completions';

/**
 * Enhanced AI Loan Evaluation v2.0
 * 
 * Key innovations:
 * 1. Semantic analysis using embeddings (not keyword matching)
 * 2. Explainable AI with feature attribution
 * 3. Audit trail for regulatory compliance
 * 4. Improvement suggestions
 */
async function evaluateLoan(application) {
    const startTime = Date.now();

    // 1. Run all analyses in parallel for speed
    const [lmaCompliance, euTaxonomy, semanticResult] = await Promise.all([
        Promise.resolve(evaluateLMACompliance(application)),
        Promise.resolve(evaluateEUTaxonomy(application)),
        performSemanticEvaluation(application)
    ]);

    // 2. Try DeepSeek AI for advanced narrative analysis
    let aiAnalysis = null;
    if (DEEPSEEK_API_KEY) {
        aiAnalysis = await callDeepSeekAPI(application, lmaCompliance, euTaxonomy, semanticResult);
    }

    // 3. If AI fails or no key, use enhanced local evaluation
    if (!aiAnalysis) {
        aiAnalysis = enhancedLocalEvaluation(application, lmaCompliance, euTaxonomy, semanticResult);
    }

    const processingTimeMs = Date.now() - startTime;

    // 4. Build comprehensive result
    const evaluationResult = {
        // Core scores
        green_score: aiAnalysis.green_score,
        risk_score: aiAnalysis.risk_score,
        recommendation: aiAnalysis.recommendation,
        roi_projection: aiAnalysis.roi_projection,

        // Semantic analysis (NEW - replaces keyword matching)
        semantic: {
            semantic_score: semanticResult.semantic_score,
            specificity_bonus: semanticResult.specificity_bonus,
            primary_category: semanticResult.primary_category,
            secondary_category: semanticResult.secondary_category,
            all_similarities: semanticResult.all_similarities?.slice(0, 5), // Top 5 for brevity
            quantified_metrics: semanticResult.quantified_metrics,
            analysis_method: semanticResult.analysis_method
        },

        // LMA Green Loan Principles compliance
        lma_compliance: {
            score: lmaCompliance.overall_glp_score,
            compliant: lmaCompliance.glp_compliant,
            components: lmaCompliance.components,
            eligible_categories: lmaCompliance.eligible_categories
        },

        // EU Taxonomy alignment
        eu_taxonomy: {
            eligible: euTaxonomy.eu_taxonomy_eligible,
            score: euTaxonomy.alignment_score,
            primary_objective: euTaxonomy.substantial_contribution.primary_objective,
            activity_type: euTaxonomy.activity_type,
            dnsh_passed: euTaxonomy.dnsh.passes,
            technical_criteria: euTaxonomy.technical_criteria,
            summary: euTaxonomy.summary
        },

        // Greenwashing risk
        greenwashing_risk: lmaCompliance.greenwashing_risk,

        // Processing metadata
        analysis_source: aiAnalysis.source || 'hybrid',
        processing_time_ms: processingTimeMs,
        processing_time_saved: calculateTimeSaved(processingTimeMs),
        confidence_level: calculateConfidence(lmaCompliance, euTaxonomy, aiAnalysis, semanticResult),
        model_version: '2.0.0-semantic'
    };

    // 5. Generate explainability outputs (NEW)
    const attribution = generateAttribution(evaluationResult);
    const explanation = generateNaturalLanguageExplanation(evaluationResult, attribution);
    const suggestions = generateImprovementSuggestions(attribution, evaluationResult);
    const auditEntry = createAuditTrailEntry(application, evaluationResult, attribution);

    // 6. Add explainability to result
    evaluationResult.explainability = {
        attribution: attribution,
        natural_language: explanation,
        improvement_suggestions: suggestions.slice(0, 5)
    };

    evaluationResult.reasoning = explanation;
    evaluationResult.audit_trail = auditEntry;

    return evaluationResult;
}

/**
 * Enhanced DeepSeek prompt with semantic context
 */
async function callDeepSeekAPI(application, lmaCompliance, euTaxonomy, semanticResult) {
    try {
        console.log("Calling DeepSeek API with semantic context...");

        const systemPrompt = `You are an expert Green Finance AI Analyst specializing in LMA Green Loan Principles and EU Taxonomy compliance. Your role is to provide DETAILED, EXPLANATORY assessments that help loan officers understand exactly WHY a project qualifies or doesn't qualify for green financing.

SEMANTIC ANALYSIS CONTEXT:
- Primary Category Match: ${semanticResult.primary_category?.category || 'None'} (${Math.round((semanticResult.primary_category?.similarity || 0) * 100)}% similarity)
- Semantic Green Score: ${semanticResult.semantic_score}/100
- Specificity Bonus: ${semanticResult.specificity_bonus}
- Quantified Metrics Found: ${Object.keys(semanticResult.quantified_metrics || {}).join(', ') || 'None'}

COMPLIANCE CONTEXT:
- LMA GLP Score: ${lmaCompliance.overall_glp_score}/100 (${lmaCompliance.glp_compliant ? 'Compliant' : 'Not Compliant'})
- EU Taxonomy: ${euTaxonomy.eu_taxonomy_eligible ? 'Eligible' : 'Not Eligible'} (Score: ${euTaxonomy.alignment_score})
- Primary Objective: ${euTaxonomy.substantial_contribution?.primary_objective || 'None'}
- Technical Criteria: ${euTaxonomy.technical_criteria?.matched_activity || 'Not matched'}
- Greenwashing Risk: ${lmaCompliance.greenwashing_risk.risk_level}
- Eligible Categories: ${lmaCompliance.eligible_categories.join(', ') || 'None identified'}

TASK: Provide a comprehensive assessment that:
1. EXPLAINS why this project scores as it does
2. CITES specific evidence from the application
3. IDENTIFIES what makes it green-compliant or non-compliant
4. PROVIDES actionable insights for the loan officer

OUTPUT: Return ONLY valid JSON with these exact keys:
{
  "green_score": <integer 0-100>,
  "risk_score": <integer 0-100>,
  "recommendation": <"APPROVE"|"APPROVE_WITH_CONDITIONS"|"MANUAL_REVIEW"|"REJECT">,
  "roi_projection": <float 0.0-15.0>,
  "key_strengths": [<3-5 specific strengths with evidence>],
  "key_risks": [<specific risk factors if any>],
  "reasoning_summary": <4-6 sentence detailed executive summary explaining the decision>,
  "detailed_reasoning": {
    "environmental_impact": <2-3 sentences on environmental benefits with specific metrics>,
    "compliance_assessment": <2-3 sentences on regulatory alignment>,
    "financial_viability": <1-2 sentences on financial outlook>,
    "recommendations": <1-2 actionable recommendations if any>
  }
}`;

        const response = await axios.post(API_URL, {
            model: "deepseek-chat",
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user", content: JSON.stringify({
                        applicant: application.applicant_name,
                        amount: application.amount,
                        purpose: application.purpose
                    })
                }
            ],
            temperature: 0.2,
            max_tokens: 800
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            timeout: 15000
        });

        const content = response.data.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            result.source = 'deepseek_ai';

            // Ensure detailed_reasoning exists even if AI didn't provide it
            if (!result.detailed_reasoning) {
                result.detailed_reasoning = {
                    environmental_impact: result.reasoning_summary || 'Analysis pending.',
                    compliance_assessment: 'Compliance verified against LMA GLP and EU Taxonomy criteria.',
                    financial_viability: `Projected ROI of ${result.roi_projection}% based on green credentials.`,
                    recommendations: result.key_risks?.length > 0 ? 'Address identified risks before final approval.' : 'No additional recommendations.'
                };
            }
            return result;
        }

        throw new Error('No valid JSON in response');

    } catch (error) {
        console.error("DeepSeek API error:", error.message);
        return null;
    }
}

/**
 * Enhanced local evaluation using semantic scores
 */
function enhancedLocalEvaluation(application, lmaCompliance, euTaxonomy, semanticResult) {
    const purpose = (application.purpose || '').toLowerCase();
    const amount = application.amount || 0;

    // Green Score: weighted combination with semantic as primary driver
    let green_score = Math.round(
        (semanticResult.final_green_score * 0.5) +
        (lmaCompliance.overall_glp_score * 0.25) +
        (euTaxonomy.alignment_score * 0.25)
    );

    // Risk Score: based on greenwashing risk, specificity gaps, and loan size
    let risk_score = lmaCompliance.greenwashing_risk.risk_score;

    // Penalize lack of quantified metrics
    const metricCount = Object.keys(semanticResult.quantified_metrics || {}).length;
    if (metricCount === 0) risk_score += 15;
    if (metricCount < 2) risk_score += 5;

    // Adjust risk for loan size
    if (amount > 5000000) risk_score += 10;
    if (amount > 10000000) risk_score += 10;

    // Lower risk if EU Taxonomy aligned and strong semantic match
    if (euTaxonomy.eu_taxonomy_eligible) risk_score -= 15;
    if (semanticResult.primary_category?.similarity > 0.7) risk_score -= 10;

    // Clamp scores
    green_score = Math.max(0, Math.min(100, green_score));
    risk_score = Math.max(0, Math.min(100, risk_score));

    // Determine recommendation
    let recommendation = 'MANUAL_REVIEW';
    if (green_score >= 75 && risk_score < 30 && lmaCompliance.glp_compliant) {
        recommendation = 'APPROVE';
    } else if (green_score >= 60 && risk_score < 50) {
        recommendation = 'APPROVE_WITH_CONDITIONS';
    } else if (risk_score >= 70 || lmaCompliance.greenwashing_risk.risk_level === 'HIGH') {
        recommendation = 'REJECT';
    }

    // ROI projection based on green credentials
    let roi_projection = 5.0;
    if (green_score > 80) roi_projection += 2.0;
    if (euTaxonomy.eu_taxonomy_eligible) roi_projection += 1.5;
    if (semanticResult.primary_category?.similarity > 0.8) roi_projection += 0.5;
    if (risk_score > 50) roi_projection -= 1.5;

    return {
        green_score,
        risk_score,
        recommendation,
        roi_projection: parseFloat(roi_projection.toFixed(2)),
        source: 'semantic_local',
        key_strengths: buildStrengths(semanticResult, lmaCompliance, euTaxonomy),
        key_risks: lmaCompliance.greenwashing_risk.flags.map(f => f.flag),
        reasoning_summary: buildDetailedSummary(semanticResult, lmaCompliance, euTaxonomy, green_score, recommendation),
        detailed_reasoning: {
            environmental_impact: buildEnvironmentalImpact(semanticResult, euTaxonomy),
            compliance_assessment: buildComplianceAssessment(lmaCompliance, euTaxonomy),
            financial_viability: `Projected ROI of ${roi_projection.toFixed(1)}% based on ${euTaxonomy.eu_taxonomy_eligible ? 'EU Taxonomy alignment and ' : ''}green credentials. Risk assessment indicates ${risk_score < 30 ? 'low' : risk_score < 60 ? 'moderate' : 'elevated'} financial risk.`,
            recommendations: buildRecommendations(lmaCompliance, semanticResult)
        }
    };
}

/**
 * Build list of specific strengths
 */
function buildStrengths(semanticResult, lmaCompliance, euTaxonomy) {
    const strengths = [];

    if (semanticResult.primary_category?.similarity > 0.6) {
        strengths.push(`Strong alignment with ${formatCategoryName(semanticResult.primary_category.category)} (${Math.round(semanticResult.primary_category.similarity * 100)}%)`);
    }

    if (Object.keys(semanticResult.quantified_metrics || {}).length > 0) {
        strengths.push('Quantified environmental metrics provided');
    }

    if (lmaCompliance.glp_compliant) {
        strengths.push('Meets LMA Green Loan Principles');
    }

    if (euTaxonomy.eu_taxonomy_eligible) {
        strengths.push(`EU Taxonomy aligned: ${euTaxonomy.substantial_contribution.primary_objective}`);
    }

    return strengths;
}

/**
 * Format category name for display
 */
function formatCategoryName(category) {
    return (category || '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Calculate confidence level with more factors
 */
function calculateConfidence(lmaCompliance, euTaxonomy, aiAnalysis, semanticResult) {
    let confidence = 40; // Base

    // Semantic match confidence
    if (semanticResult?.primary_category?.similarity > 0.7) confidence += 15;
    if (semanticResult?.primary_category?.similarity > 0.5) confidence += 10;

    // Data availability confidence
    if (lmaCompliance.eligible_categories.length > 0) confidence += 10;
    if (euTaxonomy.substantial_contribution.all_objectives.length > 0) confidence += 10;
    if (Object.keys(semanticResult?.quantified_metrics || {}).length > 0) confidence += 10;

    // Analysis source confidence
    if (aiAnalysis?.source === 'deepseek_ai') confidence += 15;

    // Lower confidence if greenwashing flags
    confidence -= (lmaCompliance.greenwashing_risk.flags?.length || 0) * 5;

    return Math.max(30, Math.min(100, confidence)) + '%';
}

/**
 * Calculate human-readable time saved
 */
function calculateTimeSaved(processingTimeMs) {
    const secondsProcessed = processingTimeMs / 1000;
    const manualDays = 12; // Industry average for manual green loan review
    const manualHours = manualDays * 8;
    const hoursSaved = manualHours - (secondsProcessed / 3600);

    return {
        automated_seconds: secondsProcessed.toFixed(2),
        manual_estimate_hours: manualHours,
        hours_saved: Math.round(hoursSaved),
        efficiency_multiple: Math.round(manualHours * 3600 / secondsProcessed) + 'x'
    };
}

/**
 * Build detailed summary for local evaluation
 */
function buildDetailedSummary(semanticResult, lmaCompliance, euTaxonomy, greenScore, recommendation) {
    const category = formatCategoryName(semanticResult.primary_category?.category || 'green project');
    const similarity = Math.round((semanticResult.primary_category?.similarity || 0) * 100);

    let summary = `This ${category} project achieved a green score of ${greenScore}/100 based on semantic analysis showing ${similarity}% alignment with recognized green finance categories. `;

    if (lmaCompliance.glp_compliant) {
        summary += `The project meets LMA Green Loan Principles requirements across all four pillars. `;
    } else {
        summary += `Some LMA Green Loan Principles criteria require attention. `;
    }

    if (euTaxonomy.eu_taxonomy_eligible) {
        summary += `EU Taxonomy alignment confirmed for ${euTaxonomy.substantial_contribution.primary_objective}. `;
    }

    const metricCount = Object.keys(semanticResult.quantified_metrics || {}).length;
    if (metricCount > 0) {
        summary += `${metricCount} quantified environmental metric(s) strengthen the application. `;
    }

    summary += `Recommendation: ${recommendation.replace(/_/g, ' ')}.`;

    return summary;
}

/**
 * Build environmental impact explanation
 */
function buildEnvironmentalImpact(semanticResult, euTaxonomy) {
    const metrics = semanticResult.quantified_metrics || {};
    const metricDescriptions = [];

    if (metrics.carbon_reduction) {
        metricDescriptions.push(`${metrics.carbon_reduction.value} ${metrics.carbon_reduction.unit} CO2 reduction`);
    }
    if (metrics.energy_capacity) {
        metricDescriptions.push(`${metrics.energy_capacity.value} ${metrics.energy_capacity.unit} generation capacity`);
    }
    if (metrics.energy_generated) {
        metricDescriptions.push(`${metrics.energy_generated.value} ${metrics.energy_generated.unit} annual generation`);
    }

    let impact = metricDescriptions.length > 0
        ? `The project provides measurable environmental benefits including ${metricDescriptions.join(', ')}. `
        : `The project description indicates environmental benefits, though specific metrics would strengthen the assessment. `;

    if (euTaxonomy.substantial_contribution?.primary_objective) {
        impact += `Primary contribution is to ${euTaxonomy.substantial_contribution.primary_objective}, `;
        impact += euTaxonomy.eu_taxonomy_eligible
            ? `meeting EU Taxonomy technical screening criteria.`
            : `though full EU Taxonomy alignment requires additional verification.`;
    }

    return impact;
}

/**
 * Build compliance assessment explanation
 */
function buildComplianceAssessment(lmaCompliance, euTaxonomy) {
    const components = lmaCompliance.components || {};
    const passedComponents = Object.values(components).filter(c => c.score >= 70).length;

    let assessment = `LMA Green Loan Principles assessment: ${passedComponents}/4 components fully satisfied (score: ${lmaCompliance.overall_glp_score}/100). `;

    // Add specific component feedback
    const weakComponents = Object.entries(components)
        .filter(([, v]) => v.score < 70)
        .map(([k]) => k.replace(/_/g, ' '));

    if (weakComponents.length > 0) {
        assessment += `Areas needing attention: ${weakComponents.join(', ')}. `;
    }

    if (euTaxonomy.eu_taxonomy_eligible) {
        assessment += `EU Taxonomy Article 8 disclosure: 100% taxonomy-aligned. `;
        if (euTaxonomy.technical_criteria?.matched_activity) {
            assessment += `Matches activity: ${euTaxonomy.technical_criteria.matched_activity}.`;
        }
    } else if (euTaxonomy.substantial_contribution?.contributes) {
        assessment += `EU Taxonomy: Eligible but requires additional threshold verification for full alignment.`;
    } else {
        assessment += `EU Taxonomy alignment not established - manual review recommended.`;
    }

    return assessment;
}

/**
 * Build recommendations
 */
function buildRecommendations(lmaCompliance, semanticResult) {
    const recommendations = [];

    const metricCount = Object.keys(semanticResult.quantified_metrics || {}).length;
    if (metricCount < 2) {
        recommendations.push('Add specific quantified metrics (e.g., tonnes CO2, MWh generated) to strengthen the application.');
    }

    if (!lmaCompliance.glp_compliant) {
        const weak = Object.entries(lmaCompliance.components || {})
            .filter(([, v]) => v.score < 70)
            .map(([k]) => k);
        if (weak.includes('reporting')) {
            recommendations.push('Include commitment to annual impact reporting with specific KPIs.');
        }
        if (weak.includes('project_evaluation')) {
            recommendations.push('Add details on project selection criteria and environmental due diligence process.');
        }
    }

    if (lmaCompliance.greenwashing_risk?.risk_level === 'MEDIUM') {
        recommendations.push('Consider third-party verification to reduce greenwashing risk perception.');
    }

    return recommendations.length > 0
        ? recommendations.join(' ')
        : 'Application is well-documented. No additional recommendations at this time.';
}

module.exports = { evaluateLoan };

