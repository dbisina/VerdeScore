import React from 'react';
import { motion } from 'framer-motion';

const FEATURES = [
    { label: "Repayment History", impact: 85, type: 'positive' },
    { label: "Geo-Stability", impact: 60, type: 'positive' },
    { label: "Sector Volatility", impact: 40, type: 'negative' },
    { label: "Carbon Yield", impact: 75, type: 'positive' },
    { label: "Market Trend", impact: 20, type: 'neutral' },
];

export default function AttributionBars() {
    return (
        <div className="p-6 bg-[#0f172a]/60 backdrop-blur-xl rounded-3xl border border-white/10">
            <h3 className="text-white font-semibold mb-4">Feature Attribution</h3>
            <div className="space-y-4">
                {FEATURES.map((feat, i) => (
                    <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>{feat.label}</span>
                            <span>{feat.type === 'negative' ? '-' : '+'}{feat.impact}</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                            {/* Negative space placeholder to center 0 if we wanted a bi-directional chart, but simple bar for now */}
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${feat.impact}%` }}
                                transition={{ duration: 1, delay: i * 0.1 }}
                                className={`h-full rounded-full ${feat.type === 'positive' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' :
                                        feat.type === 'negative' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                                            'bg-gray-500'
                                    }`}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
