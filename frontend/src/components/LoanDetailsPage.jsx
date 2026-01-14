import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, Zap, TrendingUp, AlertTriangle, ArrowRight, Shield, Globe } from 'lucide-react';
import RepaymentVelocityGraph from './lender/performance/RepaymentVelocityGraph';
import LoanAgingHeatmap from './lender/performance/LoanAgingHeatmap';
import DefaultProbabilityCurve from './lender/performance/DefaultProbabilityCurve';
import AIConfidenceFunnel from './lender/ai/AIConfidenceFunnel';
import CompliancePanel from './lender/CompliancePanel';
import ScreenTimeCard from './ui/screen-time-card';

// New Components
import { AttributionBreakdown, ImprovementSuggestions, BenchmarkDisplay, SemanticAnalysisCard } from './lender/ExplainabilityComponents';

import { useParams } from 'react-router-dom';
import { fetchLoans, fetchLoanExplainability, uploadLoanDocument } from '../api';

export default function LoanDetailsPage() {
    const { id } = useParams();
    const [loan, setLoan] = useState(null);
    const [explainability, setExplainability] = useState(null);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef(null);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            alert("Analyzing document with AI... please wait.");
            const result = await uploadLoanDocument(id, file);
            if (result.message === 'success') {
                const evidence = result.data.evidence_found?.length > 0 ? result.data.evidence_found.join(', ') : 'None extracted';
                const metrics = result.data.metrics ? Object.keys(result.data.metrics).map(k => `${k}: ${result.data.metrics[k].value}`).join(', ') : 'None';

                alert(`✅ Document Analysis Complete!\n\n📄 Evidence Found: ${evidence}\n📊 Metrics Extracted: ${metrics}\n🧠 Semantic Alignment: ${result.data.semantic_score}/100`);
            }
        } catch (err) {
            console.error(err);
            alert('Upload/Analysis failed. See console.');
        }
    };

    useEffect(() => {
        const load = async () => {
            try {
                // Fetch basic loan data
                const result = await fetchLoans();
                const found = result.data?.find(l => l.id.toString() === id);
                setLoan(found);

                // Fetch detailed explainability if loan found
                if (found) {
                    const explainRes = await fetchLoanExplainability(id);
                    if (explainRes.status === 'success') {
                        setExplainability(explainRes.data);
                    }
                }
            } catch (err) {
                console.error("Error loading loan details:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    // Fallback if no loan is found or loading
    const displayLoan = loan || {
        applicant_name: "Solar Farm Expansion #4092",
        amount: 1500000,
        risk_score: 92,
        green_score: 95,
        repayment_velocity: 85,
        default_probability: 2.5,
        impact_co2_tonnes: 450,
        impact_trees_planted: 1240,
        status: "APPROVED",
        reasoning: "Mock Reasoning: Solar expansion fits perfectly with green energy criteria."
    };

    if (loading) return <div className="p-10 text-white">Loading...</div>;

    // Parse compliance data from loan if available
    const lmaCompliance = loan?.lma_compliance || {
        score: Math.min(100, displayLoan.green_score + 10),
        compliant: displayLoan.green_score >= 60,
        components: {
            use_of_proceeds: { score: displayLoan.green_score, reasoning: 'Based on loan purpose analysis' },
            project_evaluation: { score: Math.max(50, displayLoan.green_score - 10), reasoning: 'Environmental objectives assessed' },
            management_of_proceeds: { score: 75, reasoning: 'Standard tracking expected' },
            reporting: { score: 60, reasoning: 'Basic impact reporting feasible' }
        },
        eligible_categories: ['Renewable Energy Production']
    };

    const euTaxonomy = loan?.eu_taxonomy || {
        eligible: displayLoan.green_score >= 70,
        score: displayLoan.green_score,
        primary_objective: 'Climate Change Mitigation',
        activity_type: { type: 'DIRECT' },
        dnsh_passed: true,
        summary: 'EU Taxonomy alignment based on green score analysis'
    };

    const greenwashingRisk = loan?.greenwashing_risk || {
        risk_level: displayLoan.risk_score > 50 ? 'MEDIUM' : 'LOW',
        risk_score: displayLoan.risk_score,
        flags: displayLoan.risk_score > 50 ? [{ flag: 'Manual review recommended' }] : [],
        recommendation: 'Standard due diligence'
    };

    // Use explainability data if available, otherwise minimal fallbacks
    const attribution = explainability?.attribution || { attributed_score: displayLoan.green_score };
    const suggestions = explainability?.improvement_suggestions || [];
    const semantic = loan?.semantic || null; // semantic is usually on the loan object now v2.0

    return (
        <div className="max-w-7xl mx-auto pt-6 pb-24 px-6">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 mb-1 flex-wrap"
                    >
                        <h2 className="text-3xl font-bold text-white">{displayLoan.applicant_name}</h2>
                        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-sm font-semibold flex items-center gap-1">
                            <BadgeCheck size={14} /> AI Recommended
                        </span>
                        {lmaCompliance.compliant && (
                            <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-semibold flex items-center gap-1">
                                <Shield size={12} /> LMA GLP
                            </span>
                        )}
                        {euTaxonomy.eligible && (
                            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold flex items-center gap-1">
                                <Globe size={12} /> EU Taxonomy
                            </span>
                        )}
                    </motion.div>
                    <p className="text-gray-400 flex gap-4 text-sm flex-wrap">
                        <span>Score: {displayLoan.green_score}/100</span>
                        <span>•</span>
                        <span>Amount: ${displayLoan.amount?.toLocaleString()}</span>
                        <span>•</span>
                        <span>Risk: {displayLoan.risk_score}/100</span>
                    </p>
                </div>

                <div className="flex gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".pdf"
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all font-medium"
                    >
                        Upload & Analyze Docs
                    </button>
                    <button className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 transition-all font-bold flex items-center gap-2">
                        Approve Loan <ArrowRight size={18} />
                    </button>
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Col 1: Performance & Activity (Large) */}
                <div className="col-span-1 md:col-span-2 space-y-6">
                    {/* Activity Volume */}
                    <ScreenTimeCard
                        totalHours={Math.floor(displayLoan.repayment_velocity || 0)}
                        totalMinutes={0}
                        labelOverride="Repayment Velocity"
                        subLabelOverride="Based on AI projection"
                        barData={[5, 12, 25, 40, 60, 85, 90, 75, 40, 20]}
                        timeLabels={['Day 1', 'Day 5', 'Day 10']}
                        topApps={[
                            { name: "Trees Planted", duration: `${displayLoan.impact_trees_planted || 0} trees`, icon: <TrendingUp size={16} /> },
                            { name: "CO2 Offset", duration: `${Math.floor(displayLoan.impact_co2_tonnes || 0)} tons`, icon: <AlertTriangle size={16} /> }
                        ]}
                        className="bg-[#0f172a]/60 border-white/10"
                    />

                    {/* AI Reasoning Card */}
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Zap size={100} />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                            AI Analysis & Reasoning
                        </h3>
                        <p className="text-lg text-gray-200 leading-relaxed font-light mb-4">
                            "{explainability?.natural_language_explanation || displayLoan.reasoning || "No specific reasoning provided."}"
                        </p>

                        {/* New Benchmark Display */}
                        {loan?.processing_time_ms && (
                            <BenchmarkDisplay
                                processingTime={loan.processing_time_ms}
                                timeSaved={explainability?.benchmark?.comparison}
                            />
                        )}
                    </div>

                    {/* Semantic Analysis */}
                    {semantic && (
                        <div className="mb-6">
                            <SemanticAnalysisCard semantic={semantic} />
                        </div>
                    )}


                    <div className="grid grid-cols-2 gap-6 h-[250px]">
                        <RepaymentVelocityGraph />
                        <DefaultProbabilityCurve />
                    </div>

                    <div className="h-[200px]">
                        <LoanAgingHeatmap />
                    </div>
                </div>

                {/* Col 2: AI Intelligence & Compliance (Sidebar) */}
                <div className="col-span-1 space-y-6">
                    {/* NEW: Compliance Panel */}
                    <CompliancePanel
                        lmaCompliance={lmaCompliance}
                        euTaxonomy={euTaxonomy}
                        greenwashingRisk={greenwashingRisk}
                    />

                    <div className="p-1 rounded-3xl bg-gradient-to-b from-blue-500/20 to-transparent">
                        <AIConfidenceFunnel />
                    </div>

                    {/* New: Attribution Breakdown */}
                    <AttributionBreakdown attribution={attribution} />

                    {/* New: Improvement Suggestions */}
                    <ImprovementSuggestions suggestions={suggestions} />

                    {/* Action Center */}
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                        <h3 className="text-white font-semibold mb-4">Lender Actions</h3>
                        <div className="space-y-3">
                            {['Compare with Peers', 'Run Risk Simulation', 'Request More Info'].map(action => (
                                <button key={action} className="w-full py-3 px-4 rounded-xl bg-black/20 hover:bg-white/5 border border-white/5 text-left text-sm text-gray-300 transition-colors flex justify-between group">
                                    {action}
                                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
