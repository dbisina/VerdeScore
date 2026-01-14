import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchLoanAging } from '../../../api';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function LoanAgingHeatmap() {
    const [data, setData] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            const res = await fetchLoanAging();
            setData(res.data || []);
        };
        loadData();
    }, []);

    // Responsive: show 6 columns on small screens, 12 on larger
    return (
        <div className="h-full w-full p-4 md:p-6 bg-[#0f172a]/60 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 gap-2">
                <div>
                    <h3 className="text-white font-semibold text-sm md:text-base">Loan Aging Heatmap</h3>
                    <p className="text-xs text-gray-500">Portfolio age distribution</p>
                </div>
                <div className="flex gap-2 items-center text-xs text-gray-500">
                    <span>New</span>
                    <div className="flex gap-1">
                        <div className="w-2 h-2 md:w-3 md:h-3 bg-blue-500/20 rounded-sm" />
                        <div className="w-2 h-2 md:w-3 md:h-3 bg-blue-500/50 rounded-sm" />
                        <div className="w-2 h-2 md:w-3 md:h-3 bg-blue-500 rounded-sm" />
                        <div className="w-2 h-2 md:w-3 md:h-3 bg-amber-500 rounded-sm" />
                    </div>
                    <span>Old</span>
                </div>
            </div>

            {/* Scrollable container for the grid */}
            <div className="overflow-x-auto">
                <div className="min-w-[300px]">
                    <div className="grid grid-cols-6 md:grid-cols-12 gap-1 md:gap-1.5">
                        {data.slice(0, 48).map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.005 }}
                                className={`
                                    h-6 md:h-8 rounded hover:ring-2 ring-white/20 transition-all cursor-pointer relative group
                                    ${item.intensity === 0 ? 'bg-white/5' :
                                        item.intensity === 1 ? 'bg-blue-500/30' :
                                            item.intensity === 2 ? 'bg-blue-500' :
                                                'bg-amber-500'}
                                `}
                            >
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-30">
                                    {item.loanId ? `Loan #${item.loanId}` : 'Empty'}
                                    {item.greenScore && ` | Green: ${item.greenScore}`}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Month labels - hidden on very small screens */}
                    <div className="hidden md:grid grid-cols-12 gap-1.5 mt-2 text-[10px] text-gray-500 font-mono text-center">
                        {MONTHS.map(m => <div key={m}>{m}</div>)}
                    </div>
                    <div className="grid md:hidden grid-cols-6 gap-1 mt-2 text-[10px] text-gray-500 font-mono text-center">
                        {MONTHS.slice(0, 6).map(m => <div key={m}>{m}</div>)}
                    </div>
                </div>
            </div>
        </div>
    );
}
