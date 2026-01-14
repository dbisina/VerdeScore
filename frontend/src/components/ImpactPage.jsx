import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Globe, TrendingUp, Zap } from 'lucide-react';
import { fetchGlobalImpact, fetchDashboardStats, fetchImpactHistory } from '../api';
import Globe3D from './lender/impact/Globe3D';
import TreeEquivalentVisualizer from './lender/impact/TreeEquivalentVisualizer';
import CarbonOffsetStreamgraph from './lender/impact/CarbonOffsetStreamgraph';
import SocialBenefitRadar from './lender/impact/SocialBenefitRadar';
import ScreenTimeCard from './ui/screen-time-card';

export default function ImpactPage() {
    const [impact, setImpact] = useState({
        totalCO2: 0,
        totalTrees: 0,
        totalEnergy: 0
    });
    const [barData, setBarData] = useState([]);
    const [roi, setRoi] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        // Fetch global impact
        const impactRes = await fetchGlobalImpact();
        setImpact(impactRes.data || { totalCO2: 0, totalTrees: 0, totalEnergy: 0 });

        // Fetch impact history for bar chart
        const historyRes = await fetchImpactHistory();
        const historyData = historyRes.data || {};
        // Combine all impact types for the bar visualization
        const combinedData = (historyData.solar || []).map((s, i) =>
            (s || 0) + (historyData.wind?.[i] || 0) + (historyData.hydro?.[i] || 0)
        );
        // Normalize to 0-100 scale for bar display
        const maxVal = Math.max(...combinedData, 1);
        setBarData(combinedData.map(v => Math.round((v / maxVal) * 100)));

        // Fetch dashboard stats for ROI
        const statsRes = await fetchDashboardStats();
        // Estimate ROI based on green score (higher green score = better ROI)
        const avgGreen = statsRes.data?.avgGreenScore || 0;
        setRoi((avgGreen * 0.15).toFixed(1)); // Rough estimation
    };

    return (
        <div className="max-w-7xl mx-auto pt-4 pb-24 px-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
                    Global Impact Tracker
                </h2>
                <p className="text-gray-400">Real-time environmental and social return on investment.</p>
            </motion.div>

            {/* Hero Stats (ScreenTimeCard usage) */}
            <div className="mb-8">
                <ScreenTimeCard
                    totalHours={Math.floor(impact.totalCO2)}
                    totalMinutes={Math.round((impact.totalCO2 % 1) * 60)}
                    labelOverride="Total CO2 Offset (Tonnes)"
                    subLabelOverride="& Equivalent Metrics"
                    barData={barData.length > 0 ? barData : [20, 45, 30, 60, 80, 75, 90, 100, 85, 70, 60, 50]}
                    timeLabels={['Jan', 'Jun', 'Dec']}
                    topApps={[
                        { name: "Trees Planted", duration: `${impact.totalTrees.toLocaleString()} trees`, icon: <Leaf size={16} /> },
                        { name: "Energy Saved", duration: `${impact.totalEnergy.toLocaleString(undefined, { maximumFractionDigits: 0 })} kWh`, icon: <Zap size={16} /> },
                        { name: "Portfolio ROI", duration: `+${roi}%`, icon: <TrendingUp size={16} /> }
                    ]}
                    className="max-w-full"
                />
            </div>

            {/* Visual Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Row 1 */}
                <div className="col-span-1 md:col-span-2 h-[400px]">
                    <CarbonOffsetStreamgraph />
                </div>
                <div className="col-span-1 h-[400px]">
                    <TreeEquivalentVisualizer treeCount={impact.totalTrees} />
                </div>

                {/* Row 2 */}
                <div className="col-span-1 md:col-span-2 h-[450px]">
                    <Globe3D />
                </div>
                <div className="col-span-1 h-[450px]">
                    <SocialBenefitRadar />
                </div>
            </div>
        </div>
    )
}
