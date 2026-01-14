import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function RiskDistributionSphere({ riskLevel = 30 }) {
    // Calculate distribution based on risk level
    const riskFactor = riskLevel / 100;
    const safeFactor = 1 - riskFactor;

    const data = [
        { name: 'Low Risk', value: Math.round(safeFactor * 40), color: '#22c55e' },
        { name: 'AAA Rated', value: Math.round(safeFactor * 25), color: '#3b82f6' },
        { name: 'Watch List', value: Math.round(riskFactor * 20), color: '#f59e0b' },
        { name: 'New/Unrated', value: Math.round(riskFactor * 15), color: '#a855f7' },
        { name: 'Secure', value: Math.round(safeFactor * 35), color: '#059669' },
    ].filter(d => d.value > 0);

    // Normalize to 100%
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const normalizedData = data.map(d => ({ ...d, value: Math.round((d.value / total) * 100) }));

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black/90 border border-white/20 rounded-lg px-3 py-2">
                    <p className="text-white text-sm font-medium">{payload[0].name}</p>
                    <p className="text-gray-400 text-xs">{payload[0].value}% of portfolio</p>
                </div>
            );
        }
        return null;
    };

    // Custom label renderer for center of donut
    const renderCenterLabel = () => (
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
            <tspan x="50%" dy="-0.3em" className="fill-white text-2xl font-bold">{riskLevel}%</tspan>
            <tspan x="50%" dy="1.5em" className="fill-gray-400 text-xs">Avg Risk</tspan>
        </text>
    );

    return (
        <div className="col-span-1 md:col-span-2 min-h-[320px] md:h-[400px] p-4 md:p-6 rounded-3xl bg-[#0f172a]/60 border border-white/10 backdrop-blur-xl overflow-hidden">
            <div className="mb-2 md:mb-4">
                <h3 className="text-base md:text-lg font-semibold text-white">Risk Distribution</h3>
                <p className="text-xs text-gray-500">Portfolio breakdown (Avg Risk: {riskLevel}%)</p>
            </div>

            <div className="h-[240px] md:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={normalizedData}
                            cx="50%"
                            cy="45%"
                            innerRadius="35%"
                            outerRadius="65%"
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                            label={false}
                        >
                            {normalizedData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            layout="horizontal"
                            align="center"
                            verticalAlign="bottom"
                            wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }}
                            formatter={(value) => <span className="text-xs text-gray-300">{value}</span>}
                        />
                        {/* Render center label using SVG text */}
                        <text x="50%" y="42%" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="24" fontWeight="bold">
                            {riskLevel}%
                        </text>
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#9ca3af" fontSize="11">
                            Avg Risk
                        </text>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
