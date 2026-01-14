import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, HelpCircle, ChevronRight, Target, AlertCircle } from 'lucide-react';

/**
 * Attribution Breakdown Component
 * Displays how each factor contributed to the final score
 */
export function AttributionBreakdown({ attribution }) {
    if (!attribution?.attributions) return null;

    const { attributions, total_positive, total_negative, attributed_score } = attribution;

    return (
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Brain size={16} className="text-purple-400" />
                Score Attribution Breakdown
            </h4>

            {/* Attribution bars */}
            <div className="space-y-4 mb-4">
                {attributions.map((attr, i) => (
                    <AttributionBar key={i} attr={attr} />
                ))}
            </div>

            {/* Summary */}
            <div className="flex justify-between text-xs pt-3 border-t border-white/10">
                <div className="flex gap-4">
                    <span className="text-green-400">+{total_positive} positive</span>
                    <span className="text-red-400">{total_negative} negative</span>
                </div>
                <span className="text-white font-semibold">
                    Final: {attributed_score}/100
                </span>
            </div>
        </div>
    );
}

function AttributionBar({ attr }) {
    const isNegative = attr.is_negative || attr.score_contribution < 0;
    const absContribution = Math.abs(attr.score_contribution);
    const absMax = Math.abs(attr.max_possible);
    const percentage = absMax > 0 ? (absContribution / absMax) * 100 : 0;

    return (
        <div className="group">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                    {isNegative ? (
                        <TrendingDown size={12} className="text-red-400" />
                    ) : (
                        <TrendingUp size={12} className="text-green-400" />
                    )}
                    {attr.name}
                </span>
                <span className={`text-xs font-medium ${isNegative ? 'text-red-400' : 'text-green-400'}`}>
                    {isNegative ? '' : '+'}{attr.score_contribution}
                </span>
            </div>

            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${isNegative
                            ? 'bg-gradient-to-r from-red-500 to-red-400'
                            : 'bg-gradient-to-r from-green-500 to-emerald-400'
                        }`}
                />
            </div>

            {/* Tooltip with details */}
            <p className="text-[10px] text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {attr.details}
            </p>
        </div>
    );
}

/**
 * Improvement Suggestions Component
 */
export function ImprovementSuggestions({ suggestions }) {
    if (!suggestions || suggestions.length === 0) return null;

    return (
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Target size={16} className="text-blue-400" />
                Improvement Suggestions
            </h4>

            <div className="space-y-3">
                {suggestions.slice(0, 4).map((suggestion, i) => (
                    <div
                        key={i}
                        className={`p-3 rounded-lg border ${suggestion.priority === 'HIGH'
                                ? 'bg-amber-500/10 border-amber-500/20'
                                : 'bg-white/5 border-white/5'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className={`text-xs font-semibold ${suggestion.priority === 'HIGH' ? 'text-amber-400' : 'text-gray-400'
                                }`}>
                                {suggestion.category}
                            </span>
                            <span className="text-xs text-green-400">
                                +{suggestion.potential_gain} pts
                            </span>
                        </div>
                        <p className="text-xs text-gray-300">{suggestion.suggestion}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Processing Benchmark Display
 */
export function BenchmarkDisplay({ processingTime, timeSaved }) {
    if (!processingTime) return null;

    const seconds = (processingTime / 1000).toFixed(2);
    const manualHours = 96; // Industry average
    const timeSavedDisplay = timeSaved?.efficiency_multiple || `${Math.round(manualHours * 3600000 / processingTime)}x`;

    return (
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-xs text-gray-400">Processing Time</div>
                    <div className="text-xl font-bold text-white">{seconds}s</div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-400">vs Manual Review</div>
                    <div className="text-xl font-bold text-green-400">{timeSavedDisplay} faster</div>
                </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
                Industry average: {manualHours} hours ({(manualHours / 24).toFixed(1)} days)
            </div>
        </div>
    );
}

/**
 * Semantic Analysis Display
 */
export function SemanticAnalysisCard({ semantic }) {
    if (!semantic) return null;

    const primaryCat = semantic.primary_category;
    const secondaryCat = semantic.secondary_category;

    return (
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Brain size={16} className="text-cyan-400" />
                Semantic Analysis
            </h4>

            {primaryCat && (
                <div className="mb-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Primary Category Match</span>
                        <span className={`text-xs font-bold ${primaryCat.similarity > 0.7 ? 'text-green-400' :
                                primaryCat.similarity > 0.5 ? 'text-amber-400' : 'text-gray-400'
                            }`}>
                            {Math.round(primaryCat.similarity * 100)}%
                        </span>
                    </div>
                    <div className="text-white font-medium capitalize mt-1">
                        {primaryCat.category?.replace(/_/g, ' ')}
                    </div>
                </div>
            )}

            {secondaryCat && secondaryCat.similarity > 0.3 && (
                <div className="text-xs text-gray-500">
                    Also aligns with: <span className="capitalize">{secondaryCat.category?.replace(/_/g, ' ')}</span> ({Math.round(secondaryCat.similarity * 100)}%)
                </div>
            )}

            <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
                <div>
                    <div className="text-gray-500">Semantic Score</div>
                    <div className="text-white font-semibold">{semantic.semantic_score}/100</div>
                </div>
                <div>
                    <div className="text-gray-500">Specificity Bonus</div>
                    <div className="text-green-400 font-semibold">+{semantic.specificity_bonus}</div>
                </div>
            </div>

            {/* Quantified metrics found */}
            {semantic.quantified_metrics && Object.keys(semantic.quantified_metrics).length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="text-xs text-gray-500 mb-2">Quantified Metrics Detected</div>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(semantic.quantified_metrics).map(([key, value]) => (
                            <span
                                key={key}
                                className="px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs text-green-400"
                            >
                                {key.replace(/_/g, ' ')}: {value.value} {value.unit}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default {
    AttributionBreakdown,
    ImprovementSuggestions,
    BenchmarkDisplay,
    SemanticAnalysisCard
};
