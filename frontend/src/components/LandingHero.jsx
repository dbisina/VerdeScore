import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Shield, Globe, Zap, ArrowRight, CheckCircle, Building2, Users, ChevronsDown } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Landing Hero Component
 * Clear value proposition for target user: Bank Loan Officers
 */
export default function LandingHero() {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-white/10 p-8 md:p-12 mb-8">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(76,175,80,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(76,175,80,0.1)_1px,transparent_1px)] bg-[size:50px_50px] opacity-20" />
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-green-500/10 to-transparent" />

            <div className="relative z-10">
                {/* Target User Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
                    <Building2 size={16} />
                    <span>For Commercial Banks & Syndicated Loan Teams</span>
                </div>

                {/* Logo/Brand */}
                <div className="flex items-center gap-3 mb-6">
                    <img src="/logo.png" alt="VerdeScore Logo" className="w-12 h-12 object-contain" />
                    <span className="text-3xl font-bold text-white tracking-tight">Verde<span className="text-green-400">Score</span></span>
                </div>

                {/* Main Headline */}
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight">
                    Green Lending, <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">Verified Instantly</span>
                </h1>

                <p className="text-xl text-green-400 font-medium mb-6">AI-Powered Green Loan Intelligence</p>

                <p className="text-lg text-gray-400 mb-8 max-w-2xl">
                    Automate LMA Green Loan Principles compliance and EU Taxonomy alignment.
                    Reduce approval time from <span className="text-red-400 line-through">2 weeks</span> to <span className="text-green-400 font-bold">2 days</span>.
                </p>

                {/* Key Value Props */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <ValueProp
                        icon={<Shield className="text-green-400" />}
                        title="LMA GLP Compliant"
                        description="4-component scoring against Green Loan Principles"
                    />
                    <ValueProp
                        icon={<Globe className="text-blue-400" />}
                        title="EU Taxonomy Aligned"
                        description="6 environmental objectives & DNSH checks"
                    />
                    <ValueProp
                        icon={<Zap className="text-amber-400" />}
                        title="Greenwashing Detection"
                        description="AI-powered narrative analysis with red flags"
                    />
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4">
                    <Link
                        to="/loans"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(76,175,80,0.3)] hover:shadow-[0_0_30px_rgba(76,175,80,0.5)]"
                    >
                        <Leaf size={20} />
                        Submit Loan Application
                        <ArrowRight size={16} />
                    </Link>
                    <Link
                        to="/reports"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 text-white rounded-xl transition-all"
                    >
                        <Building2 size={20} />
                        View Portfolio Reports
                    </Link>
                </div>

                {/* Trust Indicators */}
                <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-400" />
                        LMA Green Loan Principles
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-blue-400" />
                        EU Taxonomy Regulation
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-purple-400" />
                        Real-time AI Analysis
                    </div>
                </div>

                {/* Scroll Down Indicator */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-8 right-8 hidden md:flex flex-col items-center gap-2 text-gray-500/50"
                >
                    <span className="text-xs uppercase tracking-widest text-[10px]">Scroll</span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <ChevronsDown size={20} />
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}

function ValueProp({ icon, title, description }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
        >
            <div className="flex items-center gap-3 mb-2">
                {icon}
                <span className="font-semibold text-white">{title}</span>
            </div>
            <p className="text-sm text-gray-500">{description}</p>
        </motion.div>
    );
}

/**
 * Mini version for use in other pages
 */
export function GreenLoanBadge() {
    return (
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20">
            <div className="flex items-center gap-1">
                <Shield size={14} className="text-green-400" />
                <span className="text-xs text-green-400 font-bold">LMA GLP</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-1">
                <Globe size={14} className="text-blue-400" />
                <span className="text-xs text-blue-400 font-bold">EU Taxonomy</span>
            </div>
        </div>
    );
}
