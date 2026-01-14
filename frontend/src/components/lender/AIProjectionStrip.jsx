import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, AlertTriangle } from 'lucide-react';
import { fetchPredictions } from '../../api';

export default function AIProjectionStrip() {
    const [predictions, setPredictions] = useState([]);

    useEffect(() => {
        const loadPredictions = async () => {
            const res = await fetchPredictions();
            setPredictions(res.data || []);
        };
        loadPredictions();

        // Refresh every 30 seconds
        const interval = setInterval(loadPredictions, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-12 mb-6 overflow-hidden relative bg-white/5 border-y border-white/10 backdrop-blur-sm flex items-center">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0f172a] to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0f172a] to-transparent z-10" />

            <div className="px-4 flex items-center gap-2 border-r border-white/10 z-20 bg-[#0f172a]/80 h-full">
                <Zap size={16} className="text-secondary animate-pulse" />
                <span className="text-xs font-bold tracking-widest text-secondary uppercase">Greener Live</span>
            </div>

            <motion.div
                className="flex items-center gap-12 whitespace-nowrap pl-4"
                animate={{ x: [0, -1000] }}
                transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
            >
                {[...predictions, ...predictions].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">{item.label}</span>
                        <span className={`font-mono font-medium ${item.type === 'positive' ? 'text-green-400' :
                            item.type === 'warning' ? 'text-amber-400' : 'text-blue-400'
                            }`}>
                            {item.change}
                        </span>
                        {item.type === 'positive' && <TrendingUp size={12} className="text-green-400/50" />}
                        {item.type === 'warning' && <AlertTriangle size={12} className="text-amber-400/50" />}
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
