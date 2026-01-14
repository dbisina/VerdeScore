import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ArrowRight, Zap, Leaf, ShieldAlert } from 'lucide-react';

const MOCK_RESULTS = [
    { id: 1, title: 'Solar Farm Alpha', type: 'Loan', score: 92, risk: 'Low', date: '2h ago' },
    { id: 2, title: 'Q3 Impact Report', type: 'Report', score: null, risk: null, date: '1d ago' },
    { id: 3, title: 'Wind Turbine X', type: 'Loan', score: 88, risk: 'Medium', date: '3d ago' },
    { id: 4, title: 'Carbon Ledger #402', type: 'Ledger', score: null, risk: null, date: '5d ago' },
];

const FILTERS = ['All', 'Loans', 'Reports', 'Impact', 'High Risk'];

export default function SearchPage() {
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredResults = MOCK_RESULTS.filter(item => {
        if (activeFilter !== 'All' && item.type !== activeFilter && !(activeFilter === 'High Risk' && item.risk === 'High')) return false;
        return item.title.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="max-w-5xl mx-auto pt-8">

            {/* Liquid Search Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="mb-8"
            >
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-blue-400 mb-6 drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                    Global Search
                </h2>

                <div className="relative group">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-2xl group-hover:bg-blue-400/30 transition-all duration-500 opacity-50" />
                    <div className="relative flex items-center bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-2xl transition-all duration-300 focus-within:bg-white/10 focus-within:border-white/20">
                        <Search className="text-gray-400 w-6 h-6 mr-4 group-focus-within:text-cyan-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search for loans, reports, or metrics..."
                            className="bg-transparent border-none outline-none text-lg text-white w-full placeholder-gray-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="bg-white/10 p-2 rounded-lg border border-white/5">
                            <span className="text-xs text-gray-400 font-mono">⌘ K</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Animated Filters */}
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-3 mb-10 overflow-x-auto pb-2 scrollbar-none"
            >
                {FILTERS.map((filter, i) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`
              relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300
              ${activeFilter === filter
                                ? 'text-white shadow-[0_0_20px_rgba(56,189,248,0.4)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }
            `}
                    >
                        {activeFilter === filter && (
                            <motion.div
                                layoutId="activeFilter"
                                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10">{filter}</span>
                    </button>
                ))}
            </motion.div>

            {/* Results Grid */}
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                    {filteredResults.map((result) => (
                        <ResultCard key={result.id} result={result} />
                    ))}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

function ResultCard({ result }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="group relative bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-2xl cursor-pointer overflow-hidden hover:bg-white/10 transition-colors"
        >
            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                <ArrowRight className="text-cyan-400 w-5 h-5" />
            </div>

            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${result.type === 'Loan' ? 'bg-green-500/10 text-green-400' :
                        result.type === 'Report' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-purple-500/10 text-purple-400'
                    }`}>
                    {result.type === 'Loan' ? <Zap size={20} /> : <Leaf size={20} />}
                </div>
                {result.risk && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-md border ${result.risk === 'Low' ? 'border-green-500/30 text-green-400' : 'border-amber-500/30 text-amber-400'
                        }`}>
                        {result.risk.toUpperCase()} RISK
                    </span>
                )}
            </div>

            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-cyan-300 transition-colors">{result.title}</h3>
            <p className="text-sm text-gray-500">{result.date}</p>
        </motion.div>
    )
}
