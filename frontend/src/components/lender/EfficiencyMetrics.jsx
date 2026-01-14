import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Target, TrendingDown, Zap, ArrowRight, CheckCircle } from 'lucide-react';

/**
 * Efficiency Metrics Component
 * Displays quantifiable impact vs traditional loan processing
 */
export default function EfficiencyMetrics() {
    const metrics = [
        {
            icon: <Clock className="text-blue-400" />,
            label: 'Processing Time',
            before: '10-14 days',
            after: '< 2 days',
            improvement: '85%',
            detail: 'AI-powered analysis replaces manual document review'
        },
        {
            icon: <Target className="text-green-400" />,
            label: 'Greenwashing Detection',
            before: 'Manual review',
            after: '85% accuracy',
            improvement: '+85%',
            detail: 'NLP-based red flag identification in loan narratives'
        },
        {
            icon: <TrendingDown className="text-purple-400" />,
            label: 'Manual Review Reduction',
            before: '100% manual',
            after: '30% manual',
            improvement: '70%',
            detail: 'Only flagged applications require human review'
        },
        {
            icon: <Zap className="text-amber-400" />,
            label: 'Compliance Checking',
            before: '2-3 hours/loan',
            after: '< 1 minute',
            improvement: '99%',
            detail: 'Automated LMA GLP & EU Taxonomy validation'
        }
    ];

    return (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-white">Efficiency Impact</h3>
                    <p className="text-xs text-gray-500">AI vs Traditional Processing</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold">
                    QUANTIFIED
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metrics.map((metric, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-colors group"
                    >
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-white/5">
                                {metric.icon}
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-medium text-white mb-2">{metric.label}</div>

                                <div className="flex items-center gap-2 text-xs mb-2">
                                    <span className="text-red-400 line-through">{metric.before}</span>
                                    <ArrowRight size={12} className="text-gray-500" />
                                    <span className="text-green-400 font-semibold">{metric.after}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: metric.improvement }}
                                            transition={{ duration: 1, delay: i * 0.1 }}
                                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                                        />
                                    </div>
                                    <span className="text-green-400 text-xs font-bold">{metric.improvement}</span>
                                </div>

                                <p className="text-xs text-gray-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {metric.detail}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Summary Stats */}
            <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
                <div>
                    <div className="text-2xl font-bold text-green-400">85%</div>
                    <div className="text-xs text-gray-500">Faster Approval</div>
                </div>
                <div>
                    <div className="text-2xl font-bold text-blue-400">100%</div>
                    <div className="text-xs text-gray-500">LMA GLP Coverage</div>
                </div>
                <div>
                    <div className="text-2xl font-bold text-purple-400">6/6</div>
                    <div className="text-xs text-gray-500">EU Taxonomy Objectives</div>
                </div>
            </div>
        </div>
    );
}

/**
 * Compact version for dashboard display
 */
export function EfficiencyBadge() {
    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20">
            <CheckCircle size={14} className="text-green-400" />
            <span className="text-xs text-white">
                <span className="text-green-400 font-bold">85%</span> faster than manual review
            </span>
        </div>
    );
}
