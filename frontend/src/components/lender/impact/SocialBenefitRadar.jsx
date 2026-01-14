import React, { useEffect, useState } from 'react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';
import { Chart, ChartTooltip, ChartTooltipContent } from '../../ui/radar-chart';
import { fetchSocialImpact } from '../../../api';

const chartConfig = {
    impact: {
        label: "Project Impact",
        color: "#38bdf8", // Sky blue
    },
    benchmark: {
        label: "Benchmark",
        color: "#94a3b8", // Slate
    },
}

export default function SocialBenefitRadar() {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            const res = await fetchSocialImpact();
            setChartData(res.data || []);
        };
        loadData();
    }, []);

    return (
        <div className="h-full p-6 bg-[#0f172a]/60 backdrop-blur-xl rounded-3xl border border-white/10 flex flex-col relative overflow-hidden">
            <div className="mb-4 relative z-10">
                <h3 className="text-white font-semibold">Social Impact</h3>
                <p className="text-xs text-gray-400">vs Regional Benchmarks</p>
            </div>

            <div className="flex-1 w-full min-h-[250px] relative z-10">
                <Chart config={chartConfig} className="mx-auto w-full h-full">
                    <RadarChart data={chartData}>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: '#cbd5e1', fontSize: 10 }} />

                        <Radar
                            name="Benchmark"
                            dataKey="benchmark"
                            stroke="var(--color-benchmark)"
                            fill="var(--color-benchmark)"
                            fillOpacity={0.1}
                        />
                        <Radar
                            name="Project Impact"
                            dataKey="impact"
                            stroke="var(--color-impact)"
                            fill="var(--color-impact)"
                            fillOpacity={0.4}
                        />
                    </RadarChart>
                </Chart>
            </div>

            {/* Decorative Background */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        </div>
    );
}
