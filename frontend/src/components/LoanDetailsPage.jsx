import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BadgeCheck, Zap, TrendingUp, AlertTriangle, ArrowRight, Shield, Globe, Brain, X, Loader2, CheckCircle, XCircle } from 'lucide-react';
import RepaymentVelocityGraph from './lender/performance/RepaymentVelocityGraph';
import LoanAgingHeatmap from './lender/performance/LoanAgingHeatmap';
import DefaultProbabilityCurve from './lender/performance/DefaultProbabilityCurve';
import AIConfidenceFunnel from './lender/ai/AIConfidenceFunnel';
import CompliancePanel from './lender/CompliancePanel';
import ScreenTimeCard from './ui/screen-time-card';

// New Components
import { AttributionBreakdown, ImprovementSuggestions, BenchmarkDisplay, SemanticAnalysisCard } from './lender/ExplainabilityComponents';

import { useParams } from 'react-router-dom';
import { fetchLoans, fetchLoanExplainability, uploadLoanDocument, fetchDeepAnalysis } from '../api';

export default function LoanDetailsPage() {
    const { id } = useParams();
    const [loan, setLoan] = useState(null);
    const [explainability, setExplainability] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deepAnalysis, setDeepAnalysis] = useState(null);
    const [deepAnalysisLoading, setDeepAnalysisLoading] = useState(false);
    const [showDeepAnalysis, setShowDeepAnalysis] = useState(false);
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

    const handleDeepAnalysis = async () => {
        setDeepAnalysisLoading(true);
        setShowDeepAnalysis(true);
        try {
            const result = await fetchDeepAnalysis(id);
            if (result.status === 'success') {
                setDeepAnalysis(result);
            }
        } catch (err) {
            console.error('Deep analysis failed:', err);
        } finally {
            setDeepAnalysisLoading(false);
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

                <div className="flex gap-3 flex-wrap">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".pdf"
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={handleDeepAnalysis}
                        className="px-6 py-2.5 rounded-xl bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 text-purple-300 transition-all font-medium flex items-center gap-2"
                    >
                        <Brain size={18} /> Deep Analysis
                    </button>
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
                        <p className="text-lg text-gray-200 leading-relaxed font-light mb-4 whitespace-pre-line">
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

            {/* Deep Analysis Modal */}
            <AnimatePresence>
                {showDeepAnalysis && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setShowDeepAnalysis(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-[#0f172a] border-b border-white/10 p-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                        <Brain className="text-purple-400" size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Deep AI Analysis</h2>
                                        <p className="text-sm text-gray-400">{displayLoan.applicant_name}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowDeepAnalysis(false)}
                                    className="p-2 rounded-xl hover:bg-white/10 text-gray-400"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-6">
                                {deepAnalysisLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
                                        <p className="text-gray-400">Running deep AI analysis...</p>
                                        <p className="text-sm text-gray-500 mt-2">Checking LMA GLP, EU Taxonomy, and greenwashing risk</p>
                                    </div>
                                ) : deepAnalysis ? (
                                    <>
                                        {/* Score Summary */}
                                        <div className="grid grid-cols-5 gap-3">
                                            {Object.entries(deepAnalysis.raw_scores || {}).map(([key, value]) => (
                                                <div key={key} className="p-3 rounded-xl bg-white/5 text-center">
                                                    <div className={`text-2xl font-bold ${value >= 70 ? 'text-green-400' : value >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                                        {value || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-500 capitalize">{key.replace(/_/g, ' ')}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Analysis Sections */}
                                        {deepAnalysis.analysis?.map((section, i) => (
                                            <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="text-lg font-semibold text-white">{section.section}</h3>
                                                    {section.status && (
                                                        <span className={`text-sm font-medium ${section.status.includes('✅') ? 'text-green-400' :
                                                            section.status.includes('❌') ? 'text-red-400' : 'text-amber-400'
                                                            }`}>
                                                            {section.status}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <p className="text-gray-300 mb-4 whitespace-pre-line">{section.content}</p>

                                                {/* Gaps */}
                                                {section.gaps?.length > 0 && (
                                                    <div className="space-y-3 mb-4">
                                                        <div className="text-sm text-red-400 font-medium">Issues Found:</div>
                                                        {section.gaps.map((gap, j) => (
                                                            <div key={j} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                                                <div className="flex items-start gap-2">
                                                                    <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                                                                    <div>
                                                                        <div className="text-sm font-medium text-white">{gap.pillar || gap.criterion}</div>
                                                                        <p className="text-xs text-red-300 mt-1">{gap.issue}</p>
                                                                        {gap.fix && (
                                                                            <p className="text-xs text-green-400 mt-2">💡 {gap.fix}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Strengths */}
                                                {section.strengths?.length > 0 && (
                                                    <div className="space-y-2">
                                                        <div className="text-sm text-green-400 font-medium">Strengths:</div>
                                                        {section.strengths.map((s, j) => (
                                                            <div key={j} className="flex items-start gap-2 text-sm">
                                                                <CheckCircle size={14} className="text-green-400 mt-0.5" />
                                                                <span className="text-gray-300">{s.pillar || s.criterion}: {s.detail}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                {section.actions?.length > 0 && (
                                                    <div className="space-y-2 mt-3">
                                                        {section.actions.map((action, j) => (
                                                            <div key={j} className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/10">
                                                                <span className={`text-xs px-2 py-0.5 rounded ${action.priority === 'HIGH' ? 'bg-red-500/30 text-red-300' : 'bg-amber-500/30 text-amber-300'
                                                                    }`}>
                                                                    {action.priority}
                                                                </span>
                                                                <span className="text-sm text-gray-300">{action.action}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Flags */}
                                                {section.flags?.length > 0 && (
                                                    <div className="mt-3 space-y-1">
                                                        {section.flags.map((flag, j) => (
                                                            <div key={j} className="text-xs text-amber-400 flex items-center gap-1">
                                                                <AlertTriangle size={12} /> {flag}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {/* Processing Time */}
                                        <div className="text-center text-xs text-gray-500">
                                            Analysis completed in {deepAnalysis.processing_time_ms}ms
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-20 text-gray-400">
                                        Failed to load analysis. Please try again.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

