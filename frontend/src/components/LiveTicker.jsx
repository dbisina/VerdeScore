import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Leaf, DollarSign } from 'lucide-react';
import { fetchLedger } from '../api';

export default function LiveTicker() {
    const [trades, setTrades] = useState([]);

    useEffect(() => {
        const loadTrades = async () => {
            const res = await fetchLedger();
            const ledgerData = res.data || [];

            // Transform ledger data to ticker format
            const tickerData = ledgerData.slice(0, 10).map(trade => ({
                name: trade.applicant_name || `Loan #${trade.loan_id}`,
                value: `$${Number(trade.amount).toLocaleString()}`,
                change: `+${(Math.random() * 5 + 1).toFixed(1)}%`, // Simulated growth
                type: "up"
            }));

            // If no trades, show placeholder
            if (tickerData.length === 0) {
                tickerData.push(
                    { name: "No recent activity", value: "-", change: "", type: "neutral" },
                    { name: "Add a loan to see updates", value: "-", change: "", type: "neutral" }
                );
            }

            setTrades(tickerData);
        };
        loadTrades();

        // Refresh every 30 seconds
        const interval = setInterval(loadTrades, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full bg-black/40 border-b border-white/5 h-10 flex items-center overflow-hidden relative backdrop-blur-sm z-20">
            <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-primary to-transparent pointer-events-none" />

            <div className="flex items-center px-4 bg-secondary/10 h-full border-r border-white/5 mr-4 shrink-0">
                <span className="text-xs font-bold text-secondary flex items-center gap-1">
                    <Leaf size={12} className="animate-pulse" /> LIVE ACTIVITY
                </span>
            </div>

            <div className="flex overflow-hidden w-full mask-linear">
                <motion.div
                    className="flex gap-8 whitespace-nowrap"
                    animate={{ x: [0, -1000] }}
                    transition={{
                        repeat: Infinity,
                        duration: 30,
                        ease: "linear"
                    }}
                >
                    {[...trades, ...trades, ...trades].map((trade, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-mono">
                            <DollarSign size={12} className="text-green-400/50" />
                            <span className="text-gray-400 font-semibold">{trade.name}</span>
                            <span className="text-white">{trade.value}</span>
                            {trade.change && (
                                <span className={`flex items-center ${trade.type === 'up' ? 'text-green-400' : trade.type === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
                                    {trade.type === 'up' && <TrendingUp size={12} />}
                                    {trade.type === 'down' && <TrendingDown size={12} />}
                                    {trade.change}
                                </span>
                            )}
                        </div>
                    ))}
                </motion.div>
            </div>

            <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-[#111] to-transparent pointer-events-none" />
        </div>
    );
}
