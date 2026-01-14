import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { fetchPerformance } from '../../../api';

export default function DefaultProbabilityCurve() {
    const [data, setData] = useState([]);
    const [currentDefault, setCurrentDefault] = useState(0.3);

    useEffect(() => {
        const loadData = async () => {
            const res = await fetchPerformance();
            setData(res.data?.defaultData || []);
            setCurrentDefault(res.data?.currentDefault || 0.3);
        };
        loadData();
    }, []);

    const riskLevel = currentDefault > 5 ? 'High Risk' : currentDefault > 2 ? 'Medium Risk' : 'Low Risk';
    const riskColor = currentDefault > 5 ? 'red' : currentDefault > 2 ? 'yellow' : 'green';

    return (
        <div className="h-full w-full p-6 bg-[#0f172a]/60 backdrop-blur-xl rounded-3xl border border-white/10 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="mb-4 relative z-10">
                <div className="flex justify-between items-center">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                        Default Probability
                        <span className={`px-2 py-0.5 rounded-full bg-${riskColor}-500/20 text-${riskColor}-400 text-[10px] border border-${riskColor}-500/30`}>
                            {riskLevel}
                        </span>
                    </h3>
                    <span className="text-2xl font-bold text-white">{currentDefault.toFixed(1)}%</span>
                </div>
                <p className="text-xs text-gray-500">AI projection over 12 months</p>
            </div>

            <div className="h-40 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="month" hide />
                        <YAxis hide />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                            itemStyle={{ color: '#ef4444' }}
                            formatter={(value) => [`${value.toFixed(2)}%`, 'Default Prob']}
                        />
                        <Area
                            type="monotone"
                            dataKey="prob"
                            stroke="#ef4444"
                            fillOpacity={1}
                            fill="url(#colorProb)"
                            strokeWidth={3}
                            animationDuration={2000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
