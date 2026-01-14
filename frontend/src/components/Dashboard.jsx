import React, { useEffect, useState } from 'react';
import { fetchLoans, fetchDashboardStats, fetchMarketActivity } from '../api';
import { motion } from 'framer-motion';
import MovingDotCard from './ui/moving-dot-card';
import AIProjectionStrip from './lender/AIProjectionStrip';
import PortfolioPulseTile from './lender/PortfolioPulseTile';
import ImpactEnergyRings from './lender/ImpactEnergyRings';
import RiskDistributionSphere from './lender/RiskDistributionSphere';
import EfficiencyMetrics, { EfficiencyBadge } from './lender/EfficiencyMetrics';
import LandingHero from './LandingHero';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function ActivityChart() {
    const [data, setData] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            const res = await fetchMarketActivity();
            setData(res.data || []);
        };
        loadData();
    }, []);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Value']}
                />
                <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
        </ResponsiveContainer>
    );
}

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalAmount: 0,
        avgGreenScore: 0,
        avgRiskScore: 0,
        loanCount: 0
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        // Fetch Aggregated Stats directly from Backend
        const statsResult = await fetchDashboardStats();
        const data = statsResult.data || {};

        setStats({
            totalAmount: data.totalAmount || 0,
            avgGreenScore: data.avgGreenScore || 0,
            avgRiskScore: data.avgRiskScore || 0,
            loanCount: data.loanCount || 0
        });
    };

    return (
        <div className="pb-20"> {/* Padding for Dock */}

            {/* 1. AI Projection Strip */}
            <AIProjectionStrip />

            {/* 2. Key Metrics (Moving Dot Cards - Preserved) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <MovingDotCard label="Total Investment" target={stats.totalAmount} prefix="$" />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <MovingDotCard label="Avg Green Score" target={stats.avgGreenScore} />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <MovingDotCard label="Avg Risk Score" target={stats.avgRiskScore} />
                </motion.div>
            </div>

            {/* 3. Portfolio Pulse Hero */}
            <div className="grid grid-cols-1 mb-8">
                <PortfolioPulseTile />
            </div>

            {/* 4. Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <ImpactEnergyRings score={stats.avgGreenScore} />
                <RiskDistributionSphere riskLevel={stats.avgRiskScore} />

                {/* Real-time Market Activity Chart */}
                <div className="p-6 rounded-3xl bg-black/40 border border-white/5 backdrop-blur-md flex flex-col justify-between">
                    <h3 className="text-gray-400 font-medium mb-4">Market Momentum</h3>
                    <div className="flex-1 w-full h-[200px]">
                        <ActivityChart />
                    </div>
                </div>
            </div>

        </div>
    );
}
