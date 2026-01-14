import React from 'react';
import { motion } from 'framer-motion';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ImpactEnergyRings({ score = 75 }) {

    // Configurable derivation similar to AI module logic
    const co2Score = Math.min(100, Math.max(20, score + 10)); // Green score strongly correlates to CO2
    const socialScore = Math.min(100, Math.max(10, score - 15)); // Slightly lower correlation
    const esgScore = score;

    const data = {
        labels: ['CO2 Reduction', 'Social Benefit', 'ESG Alignment'],
        datasets: [
            {
                data: [co2Score, 100 - co2Score],
                backgroundColor: ['#10b981', 'rgba(16, 185, 129, 0.1)'],
                borderColor: ['#10b981', 'transparent'],
                borderWidth: 2,
                cutout: '90%',
                circumference: 360,
                rotation: 0,
            },
            {
                data: [socialScore, 100 - socialScore],
                backgroundColor: ['#3b82f6', 'rgba(59, 130, 246, 0.1)'],
                borderColor: ['#3b82f6', 'transparent'],
                borderWidth: 2,
                cutout: '75%',
                circumference: 360,
                rotation: 0,
            },
            {
                data: [esgScore, 100 - esgScore],
                backgroundColor: ['#8b5cf6', 'rgba(139, 92, 246, 0.1)'],
                borderColor: ['#8b5cf6', 'transparent'],
                borderWidth: 2,
                cutout: '60%',
                circumference: 360,
                rotation: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
        },
        animation: {
            animateRotate: true,
            animateScale: true,
        },
        elements: {
            arc: {
                borderRadius: 20,
            }
        }
    };

    return (
        <div className="col-span-1 h-[400px] p-6 rounded-3xl bg-[#1e293b]/40 border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-6 left-6 z-10">
                <h3 className="text-lg font-semibold text-white">Impact Energy</h3>
                <p className="text-xs text-gray-500">Based on Avg Green Score: {score}</p>
            </div>

            {/* Rotating Container */}
            <div className="relative w-64 h-64">
                <Doughnut data={data} options={options} />

                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-white">
                        {score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : 'C'}
                    </span>
                    <span className="text-xs text-green-400">Rating</span>
                </div>

                {/* Decorative Spinning Ring */}
                <div className="absolute inset-0 rounded-full border border-dashed border-white/10 animate-[spin_10s_linear_infinite]" />
            </div>

            <div className="mt-6 flex gap-4 text-xs">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> CO2</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> Social</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500" /> ESG</div>
            </div>
        </div>
    );
}
