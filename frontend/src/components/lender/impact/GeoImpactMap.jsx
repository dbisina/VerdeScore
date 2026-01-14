import React from 'react';
import { motion } from 'framer-motion';

const LOCATIONS = [
    { id: 1, x: '20%', y: '30%', size: 40, delay: 0 },
    { id: 2, x: '60%', y: '45%', size: 60, delay: 1 },
    { id: 3, x: '80%', y: '25%', size: 30, delay: 2 },
    { id: 4, x: '35%', y: '60%', size: 50, delay: 1.5 },
];

export default function GeoImpactMap() {
    return (
        <div className="col-span-1 md:col-span-2 h-full min-h-[300px] p-6 bg-[#0f172a]/60 backdrop-blur-xl rounded-3xl border border-white/10 relative overflow-hidden">
            <h3 className="text-white font-semibold mb-1">Global Impact Map</h3>
            <p className="text-xs text-gray-500 mb-6">Active project locations</p>

            {/* Abstract Map Background (CSS Grid/Dots) */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
            <div className="absolute inset-0 flex items-center justify-center">
                {/* Stylized World Map Silhouette (SVG) */}
                <svg viewBox="0 0 1000 500" className="w-full h-full opacity-20 fill-current text-blue-500">
                    <path d="M50,150 Q150,50 250,150 T450,150 T650,150 T850,150" stroke="none" />
                    {/* Placeholder for actual world map path, using abstract shape for now */}
                    <rect x="100" y="100" width="200" height="150" rx="20" />
                    <rect x="400" y="50" width="300" height="200" rx="30" />
                    <rect x="750" y="200" width="150" height="150" rx="20" />
                </svg>
            </div>

            {/* Pulse Points */}
            {LOCATIONS.map((loc) => (
                <div
                    key={loc.id}
                    className="absolute"
                    style={{ left: loc.x, top: loc.y }}
                >
                    <div className="relative flex items-center justify-center">
                        <motion.div
                            animate={{ scale: [1, 2, 2], opacity: [1, 0, 0] }}
                            transition={{ duration: 2, ease: "easeOut", repeat: Infinity, delay: loc.delay }}
                            className="absolute w-full h-full rounded-full bg-blue-400/50"
                            style={{ width: loc.size, height: loc.size }}
                        />
                        <motion.div
                            animate={{ scale: [1, 2, 2], opacity: [1, 0, 0] }}
                            transition={{ duration: 2, ease: "easeOut", repeat: Infinity, delay: loc.delay + 0.5 }}
                            className="absolute w-full h-full rounded-full bg-cyan-400/30"
                            style={{ width: loc.size * 1.5, height: loc.size * 1.5 }}
                        />
                        <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] z-10" />
                    </div>
                </div>
            ))}
        </div>
    );
}
