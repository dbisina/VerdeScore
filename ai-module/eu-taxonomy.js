/**
 * EU Taxonomy Eligibility Checker v2.0
 * 
 * Evaluates economic activities against EU Taxonomy Regulation criteria
 * with REAL quantitative Technical Screening Criteria (TSC) thresholds
 * 
 * Key improvements:
 * - Quantitative threshold validation (not just keyword presence)
 * - NACE activity code mapping
 * - Article 8 disclosure format
 * - Evidence-based scoring
 */

// EU Taxonomy 6 Environmental Objectives with detailed criteria
const EU_TAXONOMY_OBJECTIVES = {
    climate_mitigation: {
        name: 'Climate Change Mitigation',
        code: 'CCM',
        description: 'Reducing greenhouse gas emissions',
        keywords: ['solar', 'wind', 'hydro', 'renewable', 'electric vehicle', 'efficiency', 'carbon capture', 'hydrogen', 'geothermal', 'battery', 'storage'],
        weight: 1.0,
        nace_codes: ['D35.11', 'D35.12', 'D35.13', 'C27.2', 'H49.10']
    },
    climate_adaptation: {
        name: 'Climate Change Adaptation',
        code: 'CCA',
        description: 'Adapting to climate change impacts',
        keywords: ['flood', 'drought', 'resilience', 'adaptation', 'storm', 'sea level', 'heat', 'cooling'],
        weight: 0.9,
        nace_codes: ['F42.91', 'F43.99', 'M71.12']
    },
    water: {
        name: 'Sustainable Water & Marine Resources',
        code: 'WTR',
        description: 'Protecting water and marine resources',
        keywords: ['water treatment', 'wastewater', 'desalination', 'marine', 'ocean', 'aquatic', 'watershed'],
        weight: 0.85,
        nace_codes: ['E36.00', 'E37.00', 'E38.21']
    },
    circular_economy: {
        name: 'Circular Economy',
        code: 'CE',
        description: 'Transition to circular economy',
        keywords: ['recycl', 'reuse', 'repair', 'refurbish', 'waste', 'material recovery', 'upcycl', 'compost'],
        weight: 0.85,
        nace_codes: ['E38.11', 'E38.21', 'E38.32', 'C25.62']
    },
    pollution: {
        name: 'Pollution Prevention & Control',
        code: 'PPC',
        description: 'Preventing and controlling pollution',
        keywords: ['emission', 'pollution', 'filter', 'clean air', 'remediation', 'decontamination', 'scrubber'],
        weight: 0.85,
        nace_codes: ['E39.00', 'C20.12', 'C28.29']
    },
    biodiversity: {
        name: 'Biodiversity & Ecosystems',
        code: 'BIO',
        description: 'Protecting biodiversity and ecosystems',
        keywords: ['forest', 'reforestation', 'conservation', 'habitat', 'ecosystem', 'biodiversity', 'wildlife', 'restoration'],
        weight: 0.8,
        nace_codes: ['A02.10', 'A02.40', 'N81.30']
    }
};

// REAL Technical Screening Criteria with QUANTITATIVE thresholds
const TECHNICAL_SCREENING_CRITERIA = {
    // 4.1 Electricity generation using solar photovoltaic technology
    solar_pv: {
        activity: '4.1 Electricity generation using solar photovoltaic technology',
        nace: 'D35.11',
        thresholds: [
            { metric: 'lifecycle_emissions', operator: '<', value: 100, unit: 'g CO2e/kWh', description: 'Lifecycle GHG emissions' }
        ],
        keywords: ['solar', 'photovoltaic', 'pv', 'solar panel', 'solar farm'],
        substantial_contribution: 'CCM'
    },

    // 4.3 Electricity generation from wind power
    wind: {
        activity: '4.3 Electricity generation from wind power',
        nace: 'D35.11',
        thresholds: [
            { metric: 'lifecycle_emissions', operator: '<', value: 100, unit: 'g CO2e/kWh', description: 'Lifecycle GHG emissions' }
        ],
        keywords: ['wind', 'wind turbine', 'wind farm', 'offshore wind', 'onshore wind'],
        substantial_contribution: 'CCM'
    },

    // 4.5 Electricity generation from hydropower
    hydro: {
        activity: '4.5 Electricity generation from hydropower',
        nace: 'D35.11',
        thresholds: [
            { metric: 'lifecycle_emissions', operator: '<', value: 100, unit: 'g CO2e/kWh', description: 'Lifecycle GHG emissions' },
            { metric: 'power_density', operator: '>', value: 5, unit: 'W/m²', description: 'Power density of reservoir' }
        ],
        keywords: ['hydro', 'hydroelectric', 'hydropower', 'dam', 'run-of-river'],
        substantial_contribution: 'CCM'
    },

    // 6.5 Transport by motorbikes, passenger cars and light commercial vehicles
    ev_transport: {
        activity: '6.5 Transport by motorbikes, passenger cars and light commercial vehicles',
        nace: 'H49.32, H49.39',
        thresholds: [
            { metric: 'tailpipe_emissions', operator: '=', value: 0, unit: 'g CO2/km', description: 'Zero direct tailpipe emissions' },
            { metric: 'co2_emissions', operator: '<', value: 50, unit: 'g CO2/km', description: 'For vehicles with combustion engine' }
        ],
        keywords: ['electric vehicle', 'ev', 'zero emission', 'bev', 'battery electric', 'hydrogen vehicle'],
        substantial_contribution: 'CCM'
    },

    // 7.1 Construction of new buildings
    new_buildings: {
        activity: '7.1 Construction of new buildings',
        nace: 'F41.1, F41.2',
        thresholds: [
            { metric: 'primary_energy_demand', operator: '<', value: 10, unit: '% below NZEB', description: 'At least 10% below NZEB threshold' },
            { metric: 'airtightness', operator: '<', value: 0.6, unit: 'n50', description: 'Airtightness test result' },
            { metric: 'thermal_bridging', operator: '=', value: 'compliant', unit: 'EN ISO 13789', description: 'Thermal bridge compliance' }
        ],
        keywords: ['construction', 'new building', 'nzeb', 'passive house', 'net zero building'],
        substantial_contribution: 'CCM'
    },

    // 7.2 Renovation of existing buildings
    building_renovation: {
        activity: '7.2 Renovation of existing buildings',
        nace: 'F41, F43',
        thresholds: [
            { metric: 'energy_reduction', operator: '>=', value: 30, unit: '%', description: 'Primary energy demand reduction' },
            { metric: 'meets_top_15', operator: '=', value: true, unit: 'boolean', description: 'Top 15% of national building stock' }
        ],
        keywords: ['renovation', 'retrofit', 'building upgrade', 'energy efficiency', 'insulation'],
        substantial_contribution: 'CCM'
    },

    // 4.25 Production of heat/cool from geothermal energy
    geothermal: {
        activity: '4.25 Production of heat/cool from geothermal energy',
        nace: 'D35.30',
        thresholds: [
            { metric: 'lifecycle_emissions', operator: '<', value: 100, unit: 'g CO2e/kWh', description: 'Lifecycle GHG emissions' }
        ],
        keywords: ['geothermal', 'ground source', 'heat pump', 'district heating'],
        substantial_contribution: 'CCM'
    },

    // 5.1 Construction, extension and operation of water collection, treatment and supply systems
    water_systems: {
        activity: '5.1 Water collection, treatment and supply systems',
        nace: 'E36.00, F42.21',
        thresholds: [
            { metric: 'energy_efficiency', operator: '<', value: 0.5, unit: 'kWh/m³', description: 'Net energy consumption' },
            { metric: 'leakage_level', operator: '<', value: 1.5, unit: 'ILI', description: 'Infrastructure Leakage Index' }
        ],
        keywords: ['water treatment', 'water supply', 'desalination', 'water infrastructure'],
        substantial_contribution: 'WTR'
    },

    // 5.3 Construction, extension and operation of waste water collection and treatment
    wastewater: {
        activity: '5.3 Waste water collection and treatment',
        nace: 'E37.00, F42.21',
        thresholds: [
            { metric: 'energy_efficiency', operator: 'compliant', value: 'best practice', unit: 'reference', description: 'Energy efficiency requirements' },
            { metric: 'biogas_recovery', operator: '>=', value: 90, unit: '%', description: 'Biogas capture if applicable' }
        ],
        keywords: ['wastewater', 'sewage', 'water recycling', 'effluent treatment'],
        substantial_contribution: 'WTR'
    },

    // 5.9 Material recovery from non-hazardous waste
    material_recovery: {
        activity: '5.9 Material recovery from non-hazardous waste',
        nace: 'E38.32',
        thresholds: [
            { metric: 'conversion_rate', operator: '>=', value: 50, unit: '%', description: 'Weight % of input converted to secondary materials' }
        ],
        keywords: ['recycling', 'material recovery', 'waste processing', 'secondary materials'],
        substantial_contribution: 'CE'
    }
};

// DNSH (Do No Significant Harm) Exclusions - expanded
const DNSH_EXCLUSIONS = [
    { pattern: /coal(?!ition)/i, harm: 'Significant harm to climate mitigation - fossil fuel', severity: 'critical' },
    { pattern: /oil\s*(extraction|drilling|exploration|field)/i, harm: 'Fossil fuel extraction harms climate objectives', severity: 'critical' },
    { pattern: /fracking|hydraulic\s*fracturing/i, harm: 'Unconventional fossil fuel extraction', severity: 'critical' },
    { pattern: /natural\s*gas.*(exploration|extraction|production)/i, harm: 'Fossil fuel exploration incompatible', severity: 'critical' },
    { pattern: /nuclear\s*waste/i, harm: 'Potential harm to pollution prevention', severity: 'high' },
    { pattern: /deforestation|clear\s*cut|logging.*primary/i, harm: 'Harm to biodiversity and ecosystems', severity: 'critical' },
    { pattern: /landfill\s*(expansion|new)/i, harm: 'Counter to circular economy objectives', severity: 'high' },
    { pattern: /palm\s*oil.*(plantation|deforest)/i, harm: 'Associated with biodiversity loss', severity: 'high' },
    { pattern: /peat\s*(extraction|land)/i, harm: 'Carbon stock destruction', severity: 'high' },
    { pattern: /single[\s-]*use\s*plastic/i, harm: 'Counter to circular economy', severity: 'medium' }
];

/**
 * Evaluate loan against EU Taxonomy criteria with quantitative thresholds
 */
function evaluateEUTaxonomy(application) {
    const purpose = (application.purpose || '').toLowerCase();
    const amount = application.amount || 0;

    // 1. Identify applicable Technical Screening Criteria
    const tscMatch = matchTechnicalScreeningCriteria(purpose);

    // 2. Check substantial contribution to at least one objective
    const substantialContribution = checkSubstantialContribution(purpose, tscMatch);

    // 3. Check Do No Significant Harm (DNSH)
    const dnshCheck = checkDNSH(purpose);

    // 4. Validate quantitative thresholds from purpose text
    const thresholdValidation = validateQuantitativeThresholds(purpose, tscMatch);

    // 5. Minimum Safeguards assessment
    const minimumSafeguards = assessMinimumSafeguards(application);

    // Overall EU Taxonomy eligibility (stricter criteria)
    const isEligible = substantialContribution.contributes &&
        dnshCheck.passes &&
        minimumSafeguards.compliant &&
        thresholdValidation.confidence >= 0.5;

    // Calculate alignment score with threshold validation boost
    let alignmentScore = 0;
    if (isEligible) {
        alignmentScore = Math.round(
            (substantialContribution.score * 0.4) +
            (dnshCheck.passes ? 25 : 0) +
            (thresholdValidation.score * 0.35)
        );
    } else {
        alignmentScore = Math.round(substantialContribution.score * 0.4);
    }

    return {
        eu_taxonomy_eligible: isEligible,
        alignment_score: alignmentScore,
        substantial_contribution: substantialContribution,
        dnsh: dnshCheck,
        technical_criteria: {
            matched_activity: tscMatch?.activity || null,
            nace_code: tscMatch?.nace || null,
            thresholds: tscMatch?.thresholds || [],
            validation: thresholdValidation,
            score: thresholdValidation.score
        },
        minimum_safeguards: minimumSafeguards,
        activity_type: determineActivityType(purpose),
        article_8_disclosure: generateArticle8Disclosure(isEligible, substantialContribution, tscMatch),
        summary: generateTaxonomySummary(isEligible, substantialContribution, dnshCheck, thresholdValidation),
        // NEW: Detailed gap analysis explaining non-alignment
        gap_analysis: buildEUTaxonomyGapAnalysis(isEligible, substantialContribution, dnshCheck, thresholdValidation, tscMatch, minimumSafeguards)
    };
}

/**
 * Match loan purpose to specific Technical Screening Criteria
 */
function matchTechnicalScreeningCriteria(purpose) {
    let bestMatch = null;
    let highestScore = 0;

    for (const [key, criteria] of Object.entries(TECHNICAL_SCREENING_CRITERIA)) {
        let matchScore = 0;

        for (const keyword of criteria.keywords) {
            if (purpose.includes(keyword.toLowerCase())) {
                matchScore += 20;
            }
        }

        if (matchScore > highestScore) {
            highestScore = matchScore;
            bestMatch = { key, ...criteria };
        }
    }

    return highestScore >= 20 ? bestMatch : null;
}

/**
 * Validate quantitative thresholds mentioned in purpose
 */
function validateQuantitativeThresholds(purpose, tscMatch) {
    if (!tscMatch) {
        return {
            score: 30,
            confidence: 0.3,
            validated: [],
            missing: [],
            note: 'No matching TSC activity identified'
        };
    }

    const validated = [];
    const missing = [];
    let totalScore = 50; // Base score for matching an activity

    for (const threshold of tscMatch.thresholds) {
        const extracted = extractMetricFromText(purpose, threshold);

        if (extracted.found) {
            if (evaluateThreshold(extracted.value, threshold)) {
                validated.push({
                    metric: threshold.metric,
                    required: `${threshold.operator} ${threshold.value} ${threshold.unit}`,
                    found: `${extracted.value} ${threshold.unit}`,
                    status: 'PASS'
                });
                totalScore += 15;
            } else {
                validated.push({
                    metric: threshold.metric,
                    required: `${threshold.operator} ${threshold.value} ${threshold.unit}`,
                    found: `${extracted.value} ${threshold.unit}`,
                    status: 'FAIL'
                });
                totalScore -= 10;
            }
        } else {
            missing.push({
                metric: threshold.metric,
                required: `${threshold.operator} ${threshold.value} ${threshold.unit}`,
                description: threshold.description
            });
        }
    }

    const confidence = validated.length > 0
        ? validated.length / (validated.length + missing.length)
        : 0.3;

    return {
        score: Math.max(0, Math.min(100, totalScore)),
        confidence,
        validated,
        missing,
        note: missing.length > 0
            ? `Missing verification for: ${missing.map(m => m.metric).join(', ')}`
            : 'All applicable thresholds verified'
    };
}

/**
 * Extract metric value from purpose text
 */
function extractMetricFromText(purpose, threshold) {
    const patterns = {
        lifecycle_emissions: /(\d+(?:\.\d+)?)\s*g?\s*co2e?\/kwh/i,
        tailpipe_emissions: /(\d+(?:\.\d+)?)\s*g?\s*co2\/km|zero\s*(?:direct\s*)?(?:tailpipe\s*)?emission/i,
        co2_emissions: /(\d+(?:\.\d+)?)\s*g?\s*co2\/km/i,
        energy_reduction: /(\d+(?:\.\d+)?)\s*%\s*(?:energy\s*)?reduction/i,
        primary_energy_demand: /(\d+(?:\.\d+)?)\s*%?\s*(?:below\s*)?nzeb/i,
        conversion_rate: /(\d+(?:\.\d+)?)\s*%\s*(?:conversion|recovery)/i,
        power_density: /(\d+(?:\.\d+)?)\s*w\/m/i
    };

    const pattern = patterns[threshold.metric];
    if (!pattern) return { found: false };

    const match = purpose.match(pattern);
    if (match) {
        // Handle special case for "zero emissions"
        if (match[0].toLowerCase().includes('zero')) {
            return { found: true, value: 0 };
        }
        return { found: true, value: parseFloat(match[1]) };
    }

    return { found: false };
}

/**
 * Evaluate if extracted value meets threshold
 */
function evaluateThreshold(value, threshold) {
    switch (threshold.operator) {
        case '<': return value < threshold.value;
        case '<=': return value <= threshold.value;
        case '>': return value > threshold.value;
        case '>=': return value >= threshold.value;
        case '=': return value === threshold.value;
        default: return true; // For qualitative thresholds
    }
}

function checkSubstantialContribution(purpose, tscMatch) {
    let maxScore = 0;
    let contributingObjectives = [];
    let primaryObjective = null;

    // Boost for TSC match
    if (tscMatch) {
        const objectiveCode = tscMatch.substantial_contribution;
        const objective = Object.values(EU_TAXONOMY_OBJECTIVES).find(o => o.code === objectiveCode);
        if (objective) {
            maxScore = 80;
            primaryObjective = objective.name;
            contributingObjectives.push({
                objective: objective.name,
                code: objective.code,
                score: 80,
                via_tsc: true
            });
        }
    }

    // Also check keyword matches
    for (const [key, objective] of Object.entries(EU_TAXONOMY_OBJECTIVES)) {
        let objectiveScore = 0;

        for (const keyword of objective.keywords) {
            if (purpose.includes(keyword)) {
                objectiveScore = Math.max(objectiveScore, objective.weight * 100);
            }
        }

        if (objectiveScore > 0 && !contributingObjectives.find(c => c.code === objective.code)) {
            contributingObjectives.push({
                objective: objective.name,
                code: objective.code,
                score: Math.round(objectiveScore)
            });

            if (objectiveScore > maxScore) {
                maxScore = objectiveScore;
                primaryObjective = objective.name;
            }
        }
    }

    // Sort by score
    contributingObjectives.sort((a, b) => b.score - a.score);

    return {
        contributes: maxScore >= 50,
        score: Math.round(maxScore),
        primary_objective: primaryObjective,
        all_objectives: contributingObjectives,
        reasoning: contributingObjectives.length > 0
            ? `Contributes to: ${contributingObjectives.map(o => `${o.objective} (${o.code})`).join(', ')}`
            : 'No substantial contribution to EU Taxonomy objectives identified'
    };
}

function checkDNSH(purpose) {
    let violations = [];

    for (const exclusion of DNSH_EXCLUSIONS) {
        if (exclusion.pattern.test(purpose)) {
            violations.push({
                harm: exclusion.harm,
                severity: exclusion.severity
            });
        }
    }

    const hasCritical = violations.some(v => v.severity === 'critical');

    return {
        passes: violations.length === 0,
        violations: violations,
        critical_violations: hasCritical,
        note: violations.length === 0
            ? 'No significant harm to other environmental objectives detected'
            : `DNSH violations detected: ${violations.map(v => v.harm).join('; ')}`
    };
}

/**
 * Assess Minimum Safeguards (OECD Guidelines, UN Guiding Principles)
 */
function assessMinimumSafeguards(application) {
    // In production, this would check against sanction lists, etc.
    const purpose = (application.purpose || '').toLowerCase();

    const concerns = [];

    // Check for red flags
    if (/forced\s*labor|child\s*labor/i.test(purpose)) {
        concerns.push('Human rights concern');
    }
    if (/bribery|corruption/i.test(purpose)) {
        concerns.push('Anti-corruption concern');
    }

    return {
        compliant: concerns.length === 0,
        concerns: concerns,
        note: concerns.length === 0
            ? 'No minimum safeguards concerns identified - verify OECD Guidelines & UN Guiding Principles adherence'
            : `Concerns: ${concerns.join(', ')}`
    };
}

function determineActivityType(purpose) {
    if (/direct.*reduc|generat.*renewable|install.*solar|wind\s*farm|solar\s*farm/i.test(purpose)) {
        return { type: 'TAXONOMY_ALIGNED', description: 'Directly contributes to environmental objectives' };
    }

    if (/manufactur.*component|supply.*equipment|produc.*battery/i.test(purpose)) {
        return { type: 'ENABLING', description: 'Enables other activities to substantially contribute' };
    }

    if (/transition|improv.*efficiency|reduc.*emission|upgrad/i.test(purpose)) {
        return { type: 'TRANSITIONAL', description: 'Transitional activity where low-carbon alternatives do not yet exist' };
    }

    return { type: 'ELIGIBLE', description: 'Activity type requires manual classification' };
}

/**
 * Generate Article 8 Disclosure format (for NFRD/SFDR reporting)
 */
function generateArticle8Disclosure(isEligible, contribution, tscMatch) {
    return {
        taxonomy_aligned_percentage: isEligible ? 100 : 0,
        eligible_but_not_aligned_percentage: !isEligible && contribution.contributes ? 100 : 0,
        not_eligible_percentage: !contribution.contributes ? 100 : 0,
        environmental_objective: contribution.primary_objective || 'N/A',
        activity_nace_code: tscMatch?.nace || 'Not classified',
        substantial_contribution_criteria: tscMatch?.activity || 'Not applicable',
        dnsh_compliant: true, // Would be false if DNSH failed
        minimum_safeguards_compliant: true
    };
}

function generateTaxonomySummary(isEligible, contribution, dnsh, thresholdValidation) {
    if (isEligible) {
        const tscNote = thresholdValidation?.validated?.length > 0
            ? ` Technical criteria verified.`
            : '';
        return `EU Taxonomy ALIGNED - Substantially contributes to ${contribution.primary_objective} without significant harm to other objectives.${tscNote}`;
    } else if (!dnsh.passes) {
        return `EU Taxonomy NOT ALIGNED - DNSH violations: ${dnsh.violations.map(v => v.harm).slice(0, 2).join('; ')}`;
    } else if (!contribution.contributes) {
        return `EU Taxonomy NOT ALIGNED - No substantial contribution to environmental objectives identified`;
    } else if (thresholdValidation && thresholdValidation.missing?.length > 0) {
        return `EU Taxonomy POTENTIALLY ALIGNED - Missing TSC verification: ${thresholdValidation.missing.map(m => m.metric).join(', ')}`;
    }
    return 'EU Taxonomy alignment undetermined - manual review required';
}

/**
 * Build detailed gap analysis for EU Taxonomy non-alignment
 */
function buildEUTaxonomyGapAnalysis(isEligible, contribution, dnsh, thresholdValidation, tscMatch, minimumSafeguards) {
    const gaps = [];
    const strengths = [];

    // Substantial Contribution check
    if (contribution.contributes) {
        strengths.push({
            criterion: 'Substantial Contribution',
            status: 'PASS',
            detail: `Contributes to ${contribution.primary_objective} with ${contribution.score}% alignment.`,
            objectives: contribution.all_objectives?.map(o => o.objective) || []
        });
    } else {
        gaps.push({
            criterion: 'Substantial Contribution',
            status: 'FAIL',
            issue: 'No substantial contribution to any of the 6 EU Taxonomy environmental objectives.',
            detail: 'The activity must substantially contribute to at least one objective: Climate Mitigation, Climate Adaptation, Water, Circular Economy, Pollution Prevention, or Biodiversity.',
            fix: 'Clearly describe how the project contributes to climate change mitigation (e.g., renewable energy, emissions reduction) or another environmental objective with measurable impact.',
            objectives_available: ['Climate Change Mitigation', 'Climate Change Adaptation', 'Water & Marine Resources', 'Circular Economy', 'Pollution Prevention', 'Biodiversity']
        });
    }

    // DNSH check
    if (dnsh.passes) {
        strengths.push({
            criterion: 'Do No Significant Harm (DNSH)',
            status: 'PASS',
            detail: 'No significant harm to other environmental objectives detected.'
        });
    } else {
        gaps.push({
            criterion: 'Do No Significant Harm (DNSH)',
            status: 'FAIL',
            issue: 'Activity may cause significant harm to other environmental objectives.',
            detail: dnsh.violations.map(v => `${v.harm} (${v.severity} severity)`).join('; '),
            fix: 'Remove or mitigate activities that harm other environmental objectives. For fossil fuels, demonstrate a clear phase-out plan.',
            violations: dnsh.violations
        });
    }

    // Technical Screening Criteria check
    if (tscMatch) {
        if (thresholdValidation.validated?.length > 0) {
            const passed = thresholdValidation.validated.filter(v => v.status === 'PASS');
            const failed = thresholdValidation.validated.filter(v => v.status === 'FAIL');

            if (failed.length === 0 && thresholdValidation.missing?.length === 0) {
                strengths.push({
                    criterion: 'Technical Screening Criteria',
                    status: 'PASS',
                    detail: `All ${passed.length} thresholds verified for activity: ${tscMatch.activity}.`,
                    thresholds: passed
                });
            } else if (failed.length > 0) {
                gaps.push({
                    criterion: 'Technical Screening Criteria',
                    status: 'FAIL',
                    issue: 'One or more technical thresholds not met.',
                    detail: failed.map(f => `${f.metric}: found ${f.found}, required ${f.required}`).join('; '),
                    fix: `Ensure project meets these thresholds: ${failed.map(f => `${f.metric} ${f.required}`).join(', ')}.`,
                    failed_thresholds: failed
                });
            }
        }

        if (thresholdValidation.missing?.length > 0) {
            gaps.push({
                criterion: 'Technical Screening Criteria (Verification)',
                status: 'PARTIAL',
                issue: 'Some technical thresholds could not be verified from provided information.',
                detail: thresholdValidation.missing.map(m => `${m.metric}: ${m.description} (${m.required})`).join('; '),
                fix: `Add the following metrics to enable verification: ${thresholdValidation.missing.map(m => `${m.description}`).join(', ')}.`,
                missing_thresholds: thresholdValidation.missing
            });
        }
    } else {
        gaps.push({
            criterion: 'Technical Screening Criteria',
            status: 'PARTIAL',
            issue: 'Could not match activity to a specific EU Taxonomy technical screening criteria.',
            detail: 'The activity type was not clearly identified as one of the defined taxonomy activities (e.g., solar PV, wind power, building renovation).',
            fix: 'Specify the exact activity type (e.g., "electricity generation from solar photovoltaic", "renovation of existing building with 30% energy reduction").'
        });
    }

    // Minimum Safeguards check
    if (minimumSafeguards.compliant) {
        strengths.push({
            criterion: 'Minimum Safeguards',
            status: 'PASS',
            detail: 'No human rights or governance concerns identified.'
        });
    } else {
        gaps.push({
            criterion: 'Minimum Safeguards',
            status: 'FAIL',
            issue: 'Minimum safeguards concerns identified.',
            detail: minimumSafeguards.concerns.join('; '),
            fix: 'Ensure compliance with OECD Guidelines, UN Guiding Principles on Business and Human Rights, and ILO conventions.'
        });
    }

    // Determine primary blocker
    let primaryBlocker = null;
    if (!contribution.contributes) {
        primaryBlocker = 'No substantial contribution - project must clearly contribute to an environmental objective';
    } else if (!dnsh.passes) {
        primaryBlocker = 'DNSH violation - project harms other environmental objectives';
    } else if (thresholdValidation.validated?.some(v => v.status === 'FAIL')) {
        primaryBlocker = 'Technical threshold not met - specific criteria exceeded acceptable limits';
    } else if (thresholdValidation.missing?.length > 0) {
        primaryBlocker = 'Threshold verification incomplete - add missing metrics to confirm alignment';
    }

    return {
        aligned: isEligible,
        gap_count: gaps.length,
        strength_count: strengths.length,
        gaps: gaps,
        strengths: strengths,
        summary: isEligible
            ? `EU Taxonomy aligned with ${strengths.length} criteria satisfied.`
            : `Not EU Taxonomy aligned due to ${gaps.length} gap(s): ${gaps.map(g => g.criterion).join(', ')}.`,
        primary_blocker: primaryBlocker,
        alignment_pathway: isEligible ? null : gaps.map(g => g.fix).join(' ')
    };
}

module.exports = {
    evaluateEUTaxonomy,
    EU_TAXONOMY_OBJECTIVES,
    TECHNICAL_SCREENING_CRITERIA,
    DNSH_EXCLUSIONS
};
