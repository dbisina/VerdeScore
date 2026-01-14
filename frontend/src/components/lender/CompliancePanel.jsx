import React from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, AlertTriangle, XCircle, Leaf, Globe, FileCheck, BarChart2 } from 'lucide-react';

/**
 * LMA Green Loan Principles Compliance Panel
 * Displays 4-component GLP scoring and EU Taxonomy alignment
 */
export default function CompliancePanel({ lmaCompliance, euTaxonomy, greenwashingRisk }) {
    if (!lmaCompliance && !euTaxonomy) {
        return (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center text-gray-500">
                Compliance data not available
            </div>
        );
    }

    const glpScore = lmaCompliance?.score || 0;
    const isCompliant = lmaCompliance?.compliant || false;
    const euEligible = euTaxonomy?.eligible || false;
    const euScore = euTaxonomy?.score || 0;

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-2 gap-4">
                <ScoreCard
                    title="LMA GLP Score"
                    score={glpScore}
                    icon={<Shield className={isCompliant ? 'text-green-400' : 'text-amber-400'} />}
                    status={isCompliant ? 'COMPLIANT' : 'REVIEW NEEDED'}
                    statusColor={isCompliant ? 'text-green-400' : 'text-amber-400'}
                />
                <ScoreCard
                    title="EU Taxonomy"
                    score={euScore}
                    icon={<Globe className={euEligible ? 'text-blue-400' : 'text-gray-400'} />}
                    status={euEligible ? 'ALIGNED' : 'NOT ALIGNED'}
                    statusColor={euEligible ? 'text-blue-400' : 'text-gray-500'}
                />
            </div>

            {/* GLP 4 Components */}
            {lmaCompliance?.components && (
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                        <FileCheck size={16} className="text-green-400" />
                        LMA Green Loan Principles
                    </h4>
                    <div className="space-y-3">
                        <ComponentBar
                            label="1. Use of Proceeds"
                            score={lmaCompliance.components.use_of_proceeds?.score || 0}
                            tooltip={lmaCompliance.components.use_of_proceeds?.reasoning}
                        />
                        <ComponentBar
                            label="2. Project Evaluation"
                            score={lmaCompliance.components.project_evaluation?.score || 0}
                            tooltip={lmaCompliance.components.project_evaluation?.reasoning}
                        />
                        <ComponentBar
                            label="3. Management of Proceeds"
                            score={lmaCompliance.components.management_of_proceeds?.score || 0}
                            tooltip={lmaCompliance.components.management_of_proceeds?.reasoning}
                        />
                        <ComponentBar
                            label="4. Reporting"
                            score={lmaCompliance.components.reporting?.score || 0}
                            tooltip={lmaCompliance.components.reporting?.reasoning}
                        />
                    </div>
                </div>
            )}

            {/* LMA Gap Analysis - Shows WHY not compliant */}
            {lmaCompliance?.gap_analysis?.gaps?.length > 0 && (
                <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20">
                    <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                        <AlertTriangle size={16} />
                        LMA Compliance Gaps ({lmaCompliance.gap_analysis.gap_count})
                    </h4>
                    <div className="space-y-3">
                        {lmaCompliance.gap_analysis.gaps.map((gap, i) => (
                            <GapItem key={i} gap={gap} />
                        ))}
                    </div>
                </div>
            )}

            {/* EU Taxonomy Details - Enhanced with explanations */}
            {euTaxonomy && (
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Globe size={16} className="text-blue-400" />
                        EU Taxonomy Assessment
                    </h4>

                    {/* Primary Objective with explanation */}
                    {euTaxonomy.primary_objective && (
                        <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <div className="text-xs text-blue-300 mb-1">Primary Environmental Objective</div>
                            <div className="text-white font-medium">{euTaxonomy.primary_objective}</div>
                            <p className="text-xs text-gray-400 mt-1">
                                This project substantially contributes to {euTaxonomy.primary_objective?.toLowerCase()}.
                            </p>
                        </div>
                    )}

                    {/* Compliance Checklist with explanations */}
                    <div className="space-y-3 mb-4">
                        <ComplianceItem
                            passed={euTaxonomy.dnsh_passed}
                            label="Do No Significant Harm (DNSH)"
                            explanation={euTaxonomy.dnsh_passed
                                ? "No significant harm to other environmental objectives detected"
                                : "Potential harm to other objectives requires review"}
                        />
                        <ComplianceItem
                            passed={euTaxonomy.eligible}
                            label="Technical Screening Criteria"
                            explanation={euTaxonomy.technical_criteria?.matched_activity
                                ? `Matches: ${euTaxonomy.technical_criteria.matched_activity}`
                                : "Activity type requires manual classification"}
                        />
                        <ComplianceItem
                            passed={euTaxonomy.score >= 50}
                            label="Substantial Contribution"
                            explanation={`Alignment score: ${euTaxonomy.score}/100`}
                        />
                    </div>

                    {/* Technical Criteria Thresholds */}
                    {euTaxonomy.technical_criteria?.validation?.validated?.length > 0 && (
                        <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
                            <div className="text-xs text-gray-400 mb-2">Threshold Verification</div>
                            <div className="space-y-2">
                                {euTaxonomy.technical_criteria.validation.validated.map((v, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <span className="text-gray-300">{v.metric.replace(/_/g, ' ')}</span>
                                        <span className={v.status === 'PASS' ? 'text-green-400' : 'text-red-400'}>
                                            {v.found} {v.status === 'PASS' ? '✓' : '✗'} (required: {v.required})
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Missing thresholds */}
                    {euTaxonomy.technical_criteria?.validation?.missing?.length > 0 && (
                        <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <div className="text-xs text-amber-400 mb-2 flex items-center gap-1">
                                <AlertTriangle size={12} />
                                Missing Threshold Data
                            </div>
                            <ul className="space-y-1">
                                {euTaxonomy.technical_criteria.validation.missing.slice(0, 3).map((m, i) => (
                                    <li key={i} className="text-xs text-gray-400">
                                        • {m.description} ({m.required})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Activity Type Badge */}
                    <div className="flex items-center gap-2 mb-3">
                        <BarChart2 size={14} className="text-purple-400" />
                        <span className="text-xs text-gray-300">
                            {euTaxonomy.activity_type?.type || 'N/A'}: {euTaxonomy.activity_type?.description || ''}
                        </span>
                    </div>

                    {/* Summary */}
                    <p className="text-xs text-gray-400 p-2 bg-white/5 rounded-lg">{euTaxonomy.summary}</p>
                </div>
            )}

            {/* Greenwashing Risk Alert */}
            {greenwashingRisk && greenwashingRisk.risk_level !== 'LOW' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border ${greenwashingRisk.risk_level === 'HIGH'
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-amber-500/10 border-amber-500/30'
                        }`}
                >
                    <div className="flex items-start gap-3">
                        <AlertTriangle className={
                            greenwashingRisk.risk_level === 'HIGH' ? 'text-red-400' : 'text-amber-400'
                        } size={20} />
                        <div>
                            <div className={`text-sm font-semibold ${greenwashingRisk.risk_level === 'HIGH' ? 'text-red-400' : 'text-amber-400'
                                }`}>
                                Greenwashing Risk: {greenwashingRisk.risk_level}
                            </div>
                            <ul className="mt-2 space-y-1">
                                {greenwashingRisk.flags?.slice(0, 3).map((flag, i) => (
                                    <li key={i} className="text-xs text-gray-400 flex items-center gap-2">
                                        <span className="w-1 h-1 rounded-full bg-gray-500" />
                                        {flag.flag}
                                    </li>
                                ))}
                            </ul>
                            <p className="text-xs text-gray-500 mt-2">{greenwashingRisk.recommendation}</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Eligible Categories */}
            {lmaCompliance?.eligible_categories?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {lmaCompliance.eligible_categories.map((cat, i) => (
                        <span
                            key={i}
                            className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs text-green-400"
                        >
                            <Leaf size={10} className="inline mr-1" />
                            {cat}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

function ScoreCard({ title, score, icon, status, statusColor }) {
    const getScoreColor = (s) => {
        if (s >= 70) return 'text-green-400';
        if (s >= 50) return 'text-amber-400';
        return 'text-red-400';
    };

    return (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
                {icon}
                <span className={`text-xs font-bold ${statusColor}`}>{status}</span>
            </div>
            <div className="text-xs text-gray-500 mb-1">{title}</div>
            <div className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}/100</div>
        </div>
    );
}

function ComplianceItem({ passed, label, explanation }) {
    return (
        <div className="flex items-start gap-3 p-2 rounded-lg bg-white/5">
            <div className="mt-0.5">
                {passed ? (
                    <CheckCircle size={14} className="text-green-400" />
                ) : (
                    <XCircle size={14} className="text-red-400" />
                )}
            </div>
            <div className="flex-1">
                <div className={`text-xs font-medium ${passed ? 'text-green-400' : 'text-red-400'}`}>
                    {label}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{explanation}</p>
            </div>
        </div>
    );
}

function ComponentBar({ label, score, tooltip }) {
    const getBarColor = (s) => {
        if (s >= 70) return 'bg-green-500';
        if (s >= 50) return 'bg-amber-500';
        return 'bg-red-500';
    };

    return (
        <div className="group relative">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400">{label}</span>
                <span className="text-xs text-gray-500">{score}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${getBarColor(score)}`}
                />
            </div>
            {tooltip && (
                <div className="absolute bottom-full left-0 mb-2 p-2 bg-black/90 rounded-lg text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 max-w-xs">
                    {tooltip}
                </div>
            )}
        </div>
    );
}

function GapItem({ gap }) {
    const statusColors = {
        'FAIL': 'border-red-500/30 bg-red-500/10',
        'PARTIAL': 'border-amber-500/30 bg-amber-500/10',
        'PASS': 'border-green-500/30 bg-green-500/10'
    };

    const statusIcons = {
        'FAIL': <XCircle size={14} className="text-red-400" />,
        'PARTIAL': <AlertTriangle size={14} className="text-amber-400" />,
        'PASS': <CheckCircle size={14} className="text-green-400" />
    };

    return (
        <div className={`p-3 rounded-lg border ${statusColors[gap.status] || statusColors.PARTIAL}`}>
            <div className="flex items-start gap-2 mb-2">
                {statusIcons[gap.status]}
                <div className="flex-1">
                    <div className="text-xs font-semibold text-white">
                        {gap.pillar || gap.criterion}
                        {gap.score !== undefined && (
                            <span className="ml-2 text-gray-500">({gap.score}/100)</span>
                        )}
                    </div>
                    <p className="text-xs text-red-300 mt-1">{gap.issue}</p>
                </div>
            </div>

            {gap.detail && (
                <p className="text-xs text-gray-400 mb-2 pl-6">{gap.detail}</p>
            )}

            {gap.fix && (
                <div className="pl-6 pt-2 border-t border-white/10">
                    <div className="text-xs text-green-400 font-medium mb-1">💡 How to fix:</div>
                    <p className="text-xs text-gray-300">{gap.fix}</p>
                </div>
            )}
        </div>
    );
}
