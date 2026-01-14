import React from 'react';
import { motion } from 'framer-motion';

const STEPS = [
    { label: "Data Ingest", score: 100, color: "bg-blue-500" },
    { label: "Risk Assessment", score: 92, color: "bg-cyan-500" },
    { label: "Fraud Check", score: 88, color: "bg-green-500" },
    { label: "ESG Validation", score: 95, color: "bg-purple-500" },
    { label: "Final Confidence", score: 94, color: "bg-white" }
];

export default function AIConfidenceFunnel() {
    return (
        <div className="p-6 bg-[#0f172a]/60 backdrop-blur-xl rounded-3xl border border-white/10">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Greener Confidence Logic
            </h3>

            <div className="flex flex-col items-center gap-2">
                {STEPS.map((step, i) => (
                    <motion.div
                        key={step.label}
                        initial={{ width: "120%", opacity: 0, y: 10 }}
                        animate={{ width: `${100 - (i * 15)}%`, opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className={`h-10 rounded-lg backdrop-blur-md border border-white/10 flex items-center justify-between px-4 relative overflow-hidden group`}
                        style={{ maxWidth: '100%' }}
                    >
                        <div className={`absolute inset-0 ${step.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                        {/* Particles */}
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />

                        <span className="text-xs text-gray-300 font-medium z-10">{step.label}</span>
                        <span className={`text-sm font-bold z-10 ${i === STEPS.length - 1 ? 'text-green-400' : 'text-white'}`}>
                            {step.score}%
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
