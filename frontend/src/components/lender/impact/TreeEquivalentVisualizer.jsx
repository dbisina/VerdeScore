import React from 'react';
import { motion } from 'framer-motion';
import { Trees } from 'lucide-react';

export default function TreeEquivalentVisualizer({ treeCount = 0 }) {
    return (
        <div className="col-span-1 h-full p-6 bg-[#0f172a]/60 backdrop-blur-xl rounded-3xl border border-white/10 relative overflow-hidden group hover:border-green-500/30 transition-colors">
            <h3 className="text-white font-semibold mb-1">Tree Equivalent</h3>
            <p className="text-xs text-gray-500 mb-6">Offset visualizations</p>

            <div className="flex flex-wrap gap-4 items-end justify-center h-40">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.2, type: 'spring' }}
                        className="relative"
                    >
                        <Trees
                            size={32 + (i * 8)}
                            className={`
                                text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]
                                group-hover:text-emerald-300 transition-colors
                            `}
                        />
                        {/* Growing ground shadow */}
                        <div className="w-full h-1 bg-emerald-500/20 rounded-full mt-1 blur-sm" />
                    </motion.div>
                ))}
            </div>

            <div className="absolute bottom-6 left-0 right-0 text-center">
                <span className="text-3xl font-bold text-white tracking-tight">{treeCount.toLocaleString()}</span>
                <span className="text-sm text-gray-400 ml-1">trees planted</span>
            </div>
        </div>
    );
}
