import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Award, Calendar, TrendingUp, Leaf, Target, Building2, Globe, Users, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchUserProfile, fetchDashboardStats, fetchGlobalImpact } from '../api';

export default function ProfilePage() {
    const [profile, setProfile] = useState({
        name: "Loading...",
        role: "",
        joinedYear: 2023,
        loansProcessed: 0,
        avgGreenScore: 0,
        hoursSaved: 0
    });
    const [achievements, setAchievements] = useState([]);

    const [showReport, setShowReport] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const [profileRes, statsRes, impactRes] = await Promise.all([
                fetchUserProfile(),
                fetchDashboardStats(),
                fetchGlobalImpact()
            ]);

            const profileData = profileRes.data || {};
            // We can use these stats to populate the dashboard if we want to make it dynamic later
            // For now, we are using the hardcoded 'Department' view as requested
            setProfile(profileData);
        } catch (error) {
            console.error("Error loading profile:", error);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pt-8 pb-24 px-6">

            {/* Report Modal */}
            {showReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowReport(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0f172a] border border-white/20 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <div className="flex items-center gap-3">
                                <FileText className="text-green-400" />
                                <h3 className="text-xl font-bold text-white">Department Performance Report</h3>
                            </div>
                            <span className="text-xs text-gray-400 px-3 py-1 bg-white/5 rounded-full border border-white/10">Q4 2024</span>
                        </div>

                        <div className="p-8 grid grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Compliance Summary</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-300">LMA Compliant Loans</span>
                                        <span className="text-green-400 font-bold">94%</span>
                                    </div>
                                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-400 w-[94%]" />
                                    </div>

                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-300">EU Taxonomy Aligned</span>
                                        <span className="text-blue-400 font-bold">87%</span>
                                    </div>
                                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-400 w-[87%]" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Risk Assessment</h4>
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <div className="text-2xl font-bold text-red-400 mb-1">3</div>
                                    <div className="text-xs text-red-300">Flagged for Greenwashing Review</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-white/5 flex justify-end gap-3 border-t border-white/10">
                            <button
                                className="px-4 py-2 text-gray-400 hover:text-white"
                                onClick={() => setShowReport(false)}
                            >
                                Close
                            </button>
                            <button className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-lg flex items-center gap-2">
                                <FileText size={16} /> Export PDF
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Organization Header */}
            <div className="relative mb-8 p-8 rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-white/10 overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Building2 size={200} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    {/* Org Logo */}
                    <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 backdrop-blur-xl">
                        <Building2 size={40} className="text-green-400" />
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <h2 className="text-3xl font-bold text-white">VerdeBank Commercial</h2>
                            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                                ENTERPRISE
                            </span>
                        </div>
                        <p className="text-gray-400 mb-4">Sustainability & Green Lending Department</p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-400">
                            <span className="flex items-center gap-1"><Users size={14} className="text-blue-400" /> 12 Team Members</span>
                            <span className="flex items-center gap-1"><Globe size={14} className="text-green-400" /> London HQ</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link to="/team" className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all flex items-center gap-2">
                            <Users size={18} />
                            Manage Team
                        </Link>
                        <button
                            className="px-6 py-2.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-xl text-green-400 font-medium transition-all flex items-center gap-2"
                            onClick={() => setShowReport(true)}
                        >
                            <FileText size={18} />
                            Department Report
                        </button>
                    </div>
                </div>
            </div>

            {/* Department Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Portfolio</div>
                    <div className="text-2xl font-bold text-white">$42.5M</div>
                    <div className="text-green-400 text-xs flex items-center gap-1 mt-1">
                        <TrendingUp size={12} /> +12% this month
                    </div>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Active Loans</div>
                    <div className="text-2xl font-bold text-white">24</div>
                    <div className="text-gray-500 text-xs mt-1">Across 5 regions</div>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Avg Green Score</div>
                    <div className="text-2xl font-bold text-green-400">86/100</div>
                    <div className="text-gray-500 text-xs mt-1">Top 5% of industry</div>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Impact Offset</div>
                    <div className="text-2xl font-bold text-blue-400">12.4k t</div>
                    <div className="text-xs text-gray-500 mt-1">CO2 equivalent</div>
                </div>
            </div>

            {/* Recent Activity Section (Mock) */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-6">Department Activity</h3>
                <div className="space-y-6">
                    {[
                        { user: "Sarah Chen", action: "Approved loan application #4092", time: "2 hours ago", icon: <CheckCircle size={16} className="text-green-400" /> },
                        { user: "Marcus Johnson", action: "Flagged greenwashing risk on Project Alpha", time: "4 hours ago", icon: <AlertTriangle size={16} className="text-amber-400" /> },
                        { user: "Elena Rodriguez", action: "Updated LMA compliance templates", time: "1 day ago", icon: <FileText size={16} className="text-blue-400" /> }
                    ].map((activity, i) => (
                        <div key={i} className="flex items-start gap-4 pb-6 border-b border-white/5 last:border-0 last:pb-0">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                                {activity.user.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1">
                                <div className="text-white text-sm mb-1">
                                    <span className="font-semibold">{activity.user}</span> {activity.action.replace(activity.user, '')}
                                </div>
                                <div className="text-gray-500 text-xs">{activity.time}</div>
                            </div>
                            <div className="p-2 rounded-lg bg-white/5">
                                {activity.icon}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatBox({ label, value }) {
    return (
        <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
        </div>
    )
}
