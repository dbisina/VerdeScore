import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, TrendingUp, Leaf, AlertTriangle } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { fetchLoans, fetchDashboardStats, fetchGlobalImpact } from '../api';

export default function ReportingPage() {
    const { addNotification } = useNotification();
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReportData();
    }, []);

    const loadReportData = async () => {
        try {
            const [loansRes, statsRes, impactRes] = await Promise.all([
                fetchLoans(),
                fetchDashboardStats(),
                fetchGlobalImpact()
            ]);

            const loans = loansRes.data || [];
            const stats = statsRes.data || {};
            const impact = impactRes.data || {};

            const now = new Date();
            const currentMonth = now.toLocaleString('default', { month: 'short', year: 'numeric' });
            const currentQuarter = `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`;

            setReports([
                {
                    id: 'impact',
                    title: 'Monthly Impact Summary',
                    date: currentMonth,
                    type: 'Sustainability',
                    icon: <Leaf className="text-green-400" size={20} />,
                    data: {
                        totalCO2: impact.totalCO2?.toFixed(1) || 0,
                        totalTrees: impact.totalTrees || 0,
                        totalEnergy: impact.totalEnergy?.toFixed(0) || 0,
                        avgGreenScore: stats.avgGreenScore || 0,
                        loanCount: stats.loanCount || 0
                    }
                },
                {
                    id: 'risk',
                    title: 'Portfolio Risk Assessment',
                    date: currentMonth,
                    type: 'Financial',
                    icon: <AlertTriangle className="text-amber-400" size={20} />,
                    data: {
                        avgRiskScore: stats.avgRiskScore || 0,
                        avgDefaultProbability: stats.avgDefaultProbability?.toFixed(2) || 0,
                        totalAmount: stats.totalAmount || 0,
                        highRiskLoans: loans.filter(l => l.risk_score > 50).length,
                        lowRiskLoans: loans.filter(l => l.risk_score <= 30).length
                    }
                },
                {
                    id: 'ledger',
                    title: 'Investment Ledger',
                    date: currentQuarter,
                    type: 'Audit',
                    icon: <FileText className="text-blue-400" size={20} />,
                    data: {
                        loans: loans.slice(0, 10),
                        totalLoans: loans.length,
                        totalInvested: stats.totalAmount || 0
                    }
                },
                {
                    id: 'performance',
                    title: 'AI Scoring Performance',
                    date: `${now.getFullYear()} YTD`,
                    type: 'Analytics',
                    icon: <TrendingUp className="text-purple-400" size={20} />,
                    data: {
                        avgGreenScore: stats.avgGreenScore || 0,
                        avgRiskScore: stats.avgRiskScore || 0,
                        avgRepaymentVelocity: stats.avgRepaymentVelocity?.toFixed(1) || 0,
                        loansProcessed: stats.loanCount || 0,
                        approvalRate: loans.length > 0
                            ? ((loans.filter(l => l.recommendation === 'APPROVE').length / loans.length) * 100).toFixed(1)
                            : 0
                    }
                }
            ]);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load report data:', error);
            setLoading(false);
        }
    };

    const handleSelectReport = (report) => {
        setSelectedReport(report);
        setPreviewData(report.data);
    };

    const generateCSV = (report) => {
        if (!report) return '';
        const data = report.data;
        let csv = '';

        switch (report.id) {
            case 'impact':
                csv = `Metric,Value\nTotal CO2 Offset (Tonnes),${data.totalCO2}\nTrees Planted,${data.totalTrees}\nEnergy Saved (kWh),${data.totalEnergy}\nAvg Green Score,${data.avgGreenScore}\nTotal Loans,${data.loanCount}`;
                break;
            case 'risk':
                csv = `Metric,Value\nAvg Risk Score,${data.avgRiskScore}%\nDefault Probability,${data.avgDefaultProbability}%\nTotal Portfolio,$${data.totalAmount?.toLocaleString()}\nHigh Risk Loans,${data.highRiskLoans}\nLow Risk Loans,${data.lowRiskLoans}`;
                break;
            case 'ledger':
                csv = `Applicant,Amount,Purpose,Green Score,Risk Score,Status\n` +
                    data.loans.map(l => `"${l.applicant_name}",${l.amount},"${l.purpose}",${l.green_score},${l.risk_score},${l.status}`).join('\n');
                break;
            case 'performance':
                csv = `Metric,Value\nLoans Processed,${data.loansProcessed}\nAvg Green Score,${data.avgGreenScore}\nAvg Risk Score,${data.avgRiskScore}\nRepayment Velocity,${data.avgRepaymentVelocity}%\nApproval Rate,${data.approvalRate}%`;
                break;
            default:
                csv = 'No data';
        }
        return csv;
    };

    const handleDownload = (format) => {
        if (!selectedReport) {
            addNotification('Please select a report first', 'info');
            return;
        }

        addNotification(`Generating ${format} report...`, 'info');

        setTimeout(() => {
            if (format === 'CSV') {
                const csv = generateCSV(selectedReport);
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${selectedReport.id}_report.csv`;
                a.click();
                URL.revokeObjectURL(url);
            }
            addNotification(`${format} report downloaded!`, 'success');
        }, 500);
    };

    const renderPreview = () => {
        if (!selectedReport || !previewData) {
            return (
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl bg-black/20 text-gray-500">
                    Select a report to preview content
                </div>
            );
        }

        switch (selectedReport.id) {
            case 'impact':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <PreviewStat label="CO2 Offset" value={`${previewData.totalCO2} tonnes`} />
                            <PreviewStat label="Trees Planted" value={previewData.totalTrees?.toLocaleString()} />
                            <PreviewStat label="Energy Saved" value={`${Number(previewData.totalEnergy).toLocaleString()} kWh`} />
                            <PreviewStat label="Avg Green Score" value={previewData.avgGreenScore} />
                        </div>
                    </div>
                );
            case 'risk':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <PreviewStat label="Avg Risk Score" value={`${previewData.avgRiskScore}%`} />
                            <PreviewStat label="Default Probability" value={`${previewData.avgDefaultProbability}%`} />
                            <PreviewStat label="High Risk Loans" value={previewData.highRiskLoans} color="text-red-400" />
                            <PreviewStat label="Low Risk Loans" value={previewData.lowRiskLoans} color="text-green-400" />
                        </div>
                        <div className="text-sm text-gray-400 mt-4">
                            Total Portfolio: <span className="text-white font-semibold">${previewData.totalAmount?.toLocaleString()}</span>
                        </div>
                    </div>
                );
            case 'ledger':
                return (
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                        {previewData.loans.map((loan, i) => (
                            <div key={i} className="flex justify-between items-center p-2 bg-white/5 rounded-lg text-sm">
                                <span className="text-white">{loan.applicant_name}</span>
                                <span className="text-gray-400">${loan.amount?.toLocaleString()}</span>
                                <span className={`px-2 py-0.5 rounded text-xs ${loan.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                    {loan.status}
                                </span>
                            </div>
                        ))}
                        <div className="text-sm text-gray-500 pt-2">
                            Showing {previewData.loans.length} of {previewData.totalLoans} loans
                        </div>
                    </div>
                );
            case 'performance':
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <PreviewStat label="Loans Processed" value={previewData.loansProcessed} />
                        <PreviewStat label="Approval Rate" value={`${previewData.approvalRate}%`} />
                        <PreviewStat label="Avg Green Score" value={previewData.avgGreenScore} />
                        <PreviewStat label="Repayment Velocity" value={`${previewData.avgRepaymentVelocity}%`} />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Reports & Analytics
                </h2>
                <div className="flex gap-3">
                    <button
                        onClick={() => handleDownload('PDF')}
                        disabled={!selectedReport}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={18} />
                        <span>Export PDF</span>
                    </button>
                    <button
                        onClick={() => handleDownload('CSV')}
                        disabled={!selectedReport}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary hover:bg-secondary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FileText size={18} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-400">Loading reports...</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {reports.map((report) => (
                            <ReportCard
                                key={report.id}
                                report={report}
                                selected={selectedReport?.id === report.id}
                                onClick={() => handleSelectReport(report)}
                            />
                        ))}
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            {selectedReport?.icon}
                            {selectedReport?.title || 'Report Preview'}
                        </h3>
                        {renderPreview()}
                    </div>
                </>
            )}
        </div>
    );
}

function ReportCard({ report, selected, onClick }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onClick}
            className={`p-5 rounded-xl border transition-all group cursor-pointer ${selected
                    ? 'bg-white/10 border-secondary shadow-[0_0_20px_rgba(76,175,80,0.2)]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
        >
            <div className="flex justify-between items-start mb-3">
                <div className={`p-2 rounded-lg ${selected ? 'bg-secondary/20' : 'bg-blue-500/10'}`}>
                    {report.icon}
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/5 text-gray-400">{report.type}</span>
            </div>
            <h4 className="font-medium text-lg mb-1">{report.title}</h4>
            <p className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar size={12} /> Generated: {report.date}
            </p>
        </motion.div>
    );
}

function PreviewStat({ label, value, color = 'text-white' }) {
    return (
        <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className={`text-xl font-bold ${color}`}>{value}</div>
        </div>
    );
}
