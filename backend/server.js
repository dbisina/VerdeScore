// Polyfills for pdf-parse (pdfjs-dist) compatibility on Node.js 18+
// These are browser-only APIs that pdf-parse tries to use
if (typeof globalThis.DOMMatrix === 'undefined') {
    globalThis.DOMMatrix = class DOMMatrix {
        constructor() { this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0; }
    };
}
if (typeof globalThis.ImageData === 'undefined') {
    globalThis.ImageData = class ImageData {
        constructor(w, h) { this.width = w; this.height = h; this.data = new Uint8ClampedArray(w * h * 4); }
    };
}
if (typeof globalThis.Path2D === 'undefined') {
    globalThis.Path2D = class Path2D { constructor() { } };
}

require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');
const { logAuditEntry, logBenchmark, getBenchmarkStats } = require('./database');
const aiModule = require('../ai-module');
const multer = require('multer');

// Document processor is optional - pdf-parse has compatibility issues on some Node versions
let documentProcessor = null;
try {
    documentProcessor = require('../ai-module/document-processor');
} catch (err) {
    console.warn('Warning: Document processor not available -', err.message);
}

// Configure upload storage (memory for immediate processing)
const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Track API version
const API_VERSION = '2.0.0-semantic';

// Routes
app.get('/', (req, res) => {
    res.send('AI GreenLoan Advisor API is running');
});

// Loan Scoring Endpoint
app.post('/api/score-loan', async (req, res) => {
    try {
        const loanData = req.body;
        // Call the local AI module
        const result = await aiModule.evaluateLoan(loanData);
        res.json(result);
    } catch (error) {
        console.error('Error scoring loan:', error);
        res.status(500).json({ error: 'Failed to evaluate loan' });
    }
});

// Get all loans
app.get('/api/loans', (req, res) => {
    const sql = "SELECT * FROM loans ORDER BY created_at DESC";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Deep Analysis Endpoint - On-demand detailed AI reasoning
app.post('/api/loans/:id/deep-analysis', async (req, res) => {
    const loanId = req.params.id;

    try {
        // 1. Get the loan from DB
        const loan = await new Promise((resolve, reject) => {
            db.get("SELECT * FROM loans WHERE id = ?", [loanId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        // 2. Re-run AI evaluation for fresh, detailed analysis
        const startTime = Date.now();
        const aiResult = await aiModule.evaluateLoan({
            applicant_name: loan.applicant_name,
            amount: loan.amount,
            purpose: loan.purpose
        });
        const processingTime = Date.now() - startTime;

        // 3. Build comprehensive executive-level deep analysis response
        const lmaGaps = aiResult.lma_compliance?.gap_analysis?.gaps || [];
        const lmaStrengths = aiResult.lma_compliance?.gap_analysis?.strengths || [];
        const euGaps = aiResult.eu_taxonomy?.gap_analysis?.gaps || [];
        const euStrengths = aiResult.eu_taxonomy?.gap_analysis?.strengths || [];

        const lmaScore = aiResult.lma_compliance?.overall_glp_score ?? aiResult.lma_compliance?.score ?? 0;
        const lmaCompliant = aiResult.lma_compliance?.glp_compliant ?? aiResult.lma_compliance?.compliant ?? false;
        const euScore = aiResult.eu_taxonomy?.alignment_score ?? 0;
        const euAligned = aiResult.eu_taxonomy?.eu_taxonomy_eligible ?? aiResult.eu_taxonomy?.eligible ?? false;
        const riskScore = aiResult.risk_score ?? 50;
        const greenScore = aiResult.green_score ?? 0;
        const greenwashingRisk = aiResult.greenwashing_risk?.risk_level || 'UNKNOWN';

        // Determine overall status
        let overallStatus = 'NEEDS ENHANCEMENT';
        let statusEmoji = '⚠️';
        if (greenScore >= 80 && lmaCompliant && euAligned) {
            overallStatus = 'STRONG CANDIDATE';
            statusEmoji = '✅';
        } else if (greenScore >= 70 && lmaCompliant) {
            overallStatus = 'APPROVABLE WITH CONDITIONS';
            statusEmoji = '🟡';
        } else if (greenScore < 50) {
            overallStatus = 'NOT RECOMMENDED';
            statusEmoji = '❌';
        }

        // Build executive summary
        const category = aiResult.semantic?.primary_category?.category?.replace(/_/g, ' ') || 'unclassified project';
        let execSummary = `The loan application for $${Number(loan.amount).toLocaleString()} is currently flagged as "${overallStatus}."`;

        if (overallStatus === 'NEEDS ENHANCEMENT') {
            execSummary += ` While the project has ${riskScore <= 30 ? 'low' : riskScore <= 60 ? 'moderate' : 'elevated'} financial risk and ${greenwashingRisk === 'LOW' ? 'legitimate' : 'questionable'} ${category} characteristics, the documentation lacks the specificity required to meet strict green financing standards (LMA Green Loan Principles and EU Taxonomy).`;
        } else if (overallStatus === 'STRONG CANDIDATE') {
            execSummary += ` This ${category} demonstrates comprehensive alignment with both LMA Green Loan Principles and EU Taxonomy criteria. Recommended for Green Loan classification.`;
        } else if (overallStatus === 'NOT RECOMMENDED') {
            execSummary += ` This application lacks sufficient green credentials for Green Loan classification. Consider as conventional financing only.`;
        }

        // Build key metrics table
        const keyMetrics = [
            {
                metric: 'LMA GLP Score',
                value: `${lmaScore}/100`,
                status: lmaCompliant ? '✅ Compliant' : '❌ Not Compliant',
                detail: lmaCompliant ? null : '(Threshold usually >75-80)'
            },
            {
                metric: 'EU Taxonomy',
                value: `${euScore}/100`,
                status: euAligned ? '✅ Aligned' : '❌ Not Aligned',
                detail: null
            },
            {
                metric: 'Financial Risk',
                value: `${riskScore}/100`,
                status: riskScore <= 30 ? '✅ Low Risk' : riskScore <= 60 ? '🟡 Moderate Risk' : '⚠️ Elevated Risk',
                detail: riskScore <= 30 ? '(Safe to lend financially)' : null
            },
            {
                metric: 'Greenwashing Risk',
                value: greenwashingRisk,
                status: greenwashingRisk === 'LOW' ? '✅ Legit project' : greenwashingRisk === 'MEDIUM' ? '🟡 Needs verification' : '🚨 High concern',
                detail: greenwashingRisk === 'LOW' ? '(just poor documentation)' : null
            }
        ];

        // Add CO2 metrics if available
        const co2Metric = aiResult.semantic?.quantified_metrics?.carbon_reduction;
        if (co2Metric) {
            keyMetrics.push({
                metric: 'CO2 Offset',
                value: `${co2Metric.value} ${co2Metric.unit}/yr`,
                status: '🌿 Positive Environmental Impact',
                detail: null
            });
        }

        // Build compliance gaps deep dive
        const complianceGaps = [];

        // Use of Proceeds analysis
        const useOfProceedsComp = aiResult.lma_compliance?.components?.use_of_proceeds;
        if (useOfProceedsComp && useOfProceedsComp.score < 70) {
            complianceGaps.push({
                title: 'Vague "Use of Proceeds"',
                score: `${useOfProceedsComp.score}%`,
                issue: `The application ${useOfProceedsComp.matched_categories?.length > 0 ? `lists "${useOfProceedsComp.matched_categories[0]}" broadly` : 'does not clearly specify eligible green categories'} but doesn't detail exactly how the $${Number(loan.amount).toLocaleString()} will be spent (e.g., procurement of specific equipment vs. general admin costs).`,
                fix: 'Needs a distinct breakdown of capital allocation towards green assets with specific line items.',
                priority: 'HIGH'
            });
        }

        // Project Evaluation analysis  
        const projEvalComp = aiResult.lma_compliance?.components?.project_evaluation;
        if (projEvalComp && projEvalComp.score < 70) {
            complianceGaps.push({
                title: 'Project Evaluation Weakness',
                score: `${projEvalComp.score}%`,
                issue: 'This is a weak category. The environmental objectives are assessed but not clearly articulated with quantifiable targets.',
                fix: 'The client must define specific environmental objectives (e.g., "Climate Change Mitigation") and include measurable KPIs like installed capacity, annual generation, or emissions avoided.',
                priority: 'HIGH'
            });
        }

        // Reporting analysis
        const reportingComp = aiResult.lma_compliance?.components?.reporting;
        if (reportingComp && reportingComp.score < 70) {
            complianceGaps.push({
                title: 'Reporting Commitment Gap',
                score: `${reportingComp.score}%`,
                issue: 'No clear commitment to post-disbursement impact reporting on green metrics.',
                fix: 'Condition approval on agreement to provide annual impact reports with specific metrics (MWh generated, CO2 avoided, etc.).',
                priority: 'MEDIUM'
            });
        }

        // EU Taxonomy gaps
        if (!euAligned) {
            const tscGap = euGaps.find(g => g.criterion?.includes('Technical'));
            if (tscGap) {
                complianceGaps.push({
                    title: 'EU Taxonomy Misalignment',
                    score: 'FAIL',
                    issue: `The project "Substantially contributes" to ${aiResult.eu_taxonomy?.substantial_contribution?.primary_objective || 'climate change mitigation'} but fails specific Technical Screening Criteria.`,
                    fix: 'Requires manual classification of activity types to prove it meets the "Do No Significant Harm" (DNSH) criteria and specific thresholds.',
                    priority: 'MEDIUM'
                });
            }
        }

        // Build recommended strategy
        let strategy = '';
        if (greenwashingRisk === 'LOW' && riskScore <= 40) {
            strategy = `Since the Greenwashing Risk is Low and the Financial Risk is ${riskScore <= 30 ? 'Low' : 'Moderate'}, this is a good candidate for approval IF the documentation can be fixed. You should NOT reject the loan, but rather request specific amendments.`;
        } else if (greenwashingRisk === 'HIGH') {
            strategy = 'Due to elevated greenwashing concerns, this application requires third-party verification (SPO) before consideration for Green Loan classification. Consider as conventional loan only until verified.';
        } else {
            strategy = 'This application requires documentation improvements before Green Loan approval. Request amendments addressing the gaps identified below.';
        }

        // Build immediate actions
        const immediateActions = [];

        if (complianceGaps.some(g => g.title.includes('Use of Proceeds'))) {
            immediateActions.push({
                priority: 'HIGH',
                action: 'Request More Info',
                detail: `Ask ${loan.applicant_name} to provide a detailed "Use of Proceeds" breakdown showing exact capital allocation.`,
                type: 'request'
            });
        }

        if (complianceGaps.some(g => g.title.includes('Project Evaluation'))) {
            immediateActions.push({
                priority: 'HIGH',
                action: 'Revise Project Description',
                detail: `The description needs to shift from general "${category}" to specific technical categories recognized by the EU Taxonomy (e.g., specific NACE codes).`,
                type: 'revision'
            });
        }

        if (complianceGaps.some(g => g.title.includes('Reporting'))) {
            const energyMetric = aiResult.semantic?.quantified_metrics?.energy_generated;
            immediateActions.push({
                priority: 'MEDIUM',
                action: 'Impact Reporting Commitment',
                detail: `Condition loan approval on agreement to provide annual impact reports${energyMetric ? ` (specifically verifying the ${energyMetric.value} ${energyMetric.unit}/year generation)` : ''}.`,
                type: 'condition'
            });
        }

        if (!euAligned) {
            immediateActions.push({
                priority: 'MEDIUM',
                action: 'Technical Screening Documentation',
                detail: 'Request technical specifications proving compliance with EU Taxonomy thresholds for the specific activity type.',
                type: 'request'
            });
        }

        // Build the analysis array for frontend
        let analysis = [];

        // 1. Executive Summary
        analysis.push({
            section: 'Executive Summary',
            status: `${statusEmoji} ${overallStatus}`,
            content: execSummary,
            type: 'summary'
        });

        // 2. Key Metrics at a Glance
        analysis.push({
            section: 'Key Metrics at a Glance',
            metrics: keyMetrics,
            type: 'metrics'
        });

        // 3. Deep Dive: Compliance Gaps
        if (complianceGaps.length > 0) {
            analysis.push({
                section: 'Deep Dive: The Compliance Gaps',
                content: `The AI has identified ${complianceGaps.length} specific area(s) where the application is failing to meet Green Loan standards:`,
                gaps: complianceGaps,
                type: 'gaps'
            });
        }

        // 4. Strengths (what's working)
        const allStrengths = [...lmaStrengths, ...euStrengths];
        if (allStrengths.length > 0) {
            analysis.push({
                section: 'What\'s Working',
                content: 'These aspects of the application meet Green Loan requirements:',
                strengths: allStrengths.map(s => ({
                    area: s.pillar || s.criterion,
                    detail: s.detail,
                    status: '✅ PASS'
                })),
                type: 'strengths'
            });
        }

        // 5. Recommended Strategy
        analysis.push({
            section: 'Recommended Strategy',
            content: strategy,
            recommendation: overallStatus === 'STRONG CANDIDATE' ? 'APPROVE' :
                overallStatus === 'NOT RECOMMENDED' ? 'REJECT OR CONVENTIONAL' : 'REQUEST AMENDMENTS',
            type: 'strategy'
        });

        // 6. Immediate Actions
        if (immediateActions.length > 0) {
            analysis.push({
                section: 'Immediate Actions (Priority Order)',
                actions: immediateActions,
                followup_prompt: overallStatus !== 'STRONG CANDIDATE' ?
                    `Would you like me to draft a "Request for Information" email to ${loan.applicant_name} outlining exactly which data points are missing for their Green Loan approval?` : null,
                type: 'actions'
            });
        }

        // 7. Semantic Understanding
        if (aiResult.semantic) {
            analysis.push({
                section: 'AI Understanding',
                content: `Primary category match: ${aiResult.semantic.primary_category?.category?.replace(/_/g, ' ') || 'None'} (${Math.round((aiResult.semantic.primary_category?.similarity || 0) * 100)}% confidence)`,
                semantic_score: aiResult.semantic.semantic_score,
                metrics_found: aiResult.semantic.quantified_metrics,
                type: 'insight'
            });
        }

        res.json({
            status: 'success',
            loan_id: loanId,
            applicant: loan.applicant_name,
            amount: loan.amount,
            overall_status: overallStatus,
            overall_score: greenScore,
            recommendation: overallStatus === 'STRONG CANDIDATE' ? 'APPROVE' :
                overallStatus === 'NOT RECOMMENDED' ? 'REJECT' : 'REQUEST_AMENDMENTS',
            processing_time_ms: processingTime,
            analysis: analysis,
            raw_scores: {
                green_score: greenScore,
                risk_score: riskScore,
                lma_score: lmaScore,
                eu_score: euScore,
                semantic_score: aiResult.semantic?.semantic_score,
                greenwashing_risk: greenwashingRisk
            }
        });

    } catch (error) {
        console.error('Deep analysis error:', error);
        res.status(500).json({ error: 'Failed to perform deep analysis', details: error.message });
    }
});

// Generate RFI (Request for Information) Email
app.post('/api/loans/:id/generate-rfi-email', async (req, res) => {
    try {
        const loanId = req.params.id;
        const { gaps } = req.body;

        // Get loan details
        const loan = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM loans WHERE id = ?', [loanId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        // Build intelligent email based on gaps
        const applicantName = loan.applicant_name || 'Applicant';
        const amount = Number(loan.amount).toLocaleString();
        const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        // Parse gaps into actionable items
        const actionItems = [];
        let itemNumber = 1;

        if (gaps?.some(g => g.title?.includes('Use of Proceeds') || g.title?.includes('Proceeds'))) {
            actionItems.push({
                number: itemNumber++,
                title: 'Detailed Use of Proceeds Breakdown',
                description: `Please provide a line-by-line breakdown of how the $${amount} will be allocated, specifically identifying:`,
                bullets: [
                    'Amount allocated to green assets (equipment, infrastructure)',
                    'Amount allocated to project development costs',
                    'Amount allocated to operational expenses (if any)',
                    'Confirmation that proceeds will be held in a segregated account'
                ]
            });
        }

        if (gaps?.some(g => g.title?.includes('Project Evaluation') || g.title?.includes('Evaluation'))) {
            actionItems.push({
                number: itemNumber++,
                title: 'Environmental Impact Quantification',
                description: 'To satisfy Project Evaluation requirements, please provide measurable environmental KPIs:',
                bullets: [
                    'Installed capacity (MW) and expected annual generation (MWh)',
                    'Estimated annual CO2 emissions avoided (tonnes)',
                    'Methodology used for environmental impact calculations',
                    'Third-party verification or certifications (if available)'
                ]
            });
        }

        if (gaps?.some(g => g.title?.includes('Reporting') || g.title?.includes('reporti'))) {
            actionItems.push({
                number: itemNumber++,
                title: 'Post-Disbursement Reporting Commitment',
                description: 'Confirmation of impact reporting commitment:',
                bullets: [
                    'Agreement to provide annual impact reports',
                    'Specific metrics to be reported (MWh, CO2, etc.)',
                    'Reporting format and timeline',
                    'Internal verification process'
                ]
            });
        }

        if (gaps?.some(g => g.title?.includes('EU Taxonomy') || g.title?.includes('Technical Screening'))) {
            actionItems.push({
                number: itemNumber++,
                title: 'EU Taxonomy Technical Documentation',
                description: 'For EU Taxonomy alignment, please provide:',
                bullets: [
                    'NACE code classification for the project activity',
                    'Technical specifications demonstrating compliance with screening criteria',
                    'DNSH (Do No Significant Harm) assessment for all environmental objectives',
                    'Minimum safeguards compliance documentation'
                ]
            });
        }

        // Build email content
        const emailSubject = `Request for Additional Information - Green Loan Application #${loanId}`;

        let emailBody = `Dear ${applicantName} Team,

Thank you for submitting your Green Loan application for $${amount}. We have completed our initial AI-powered assessment using our VerdeScore platform, which evaluates applications against the LMA Green Loan Principles and EU Taxonomy Regulation.

While your project demonstrates genuine environmental value, we require additional documentation to complete our Green Loan classification. This is a standard requirement to ensure compliance with international green financing standards.

REQUIRED DOCUMENTATION
`;

        actionItems.forEach(item => {
            emailBody += `
${item.number}. ${item.title}
${item.description}
${item.bullets.map(b => `   • ${b}`).join('\n')}
`;
        });

        emailBody += `
NEXT STEPS
Please submit the requested documentation within 10 business days. Upon receipt, we will:
1. Re-run our AI assessment with the updated information
2. Provide a revised Green Loan eligibility score
3. Issue a formal approval decision within 48 hours

If you have any questions about these requirements, please don't hesitate to contact our Green Finance team.

We look forward to supporting your environmental initiative.

Best regards,
Green Finance Team
VerdeScore Platform

---
This email was generated by VerdeScore AI on ${today}
Loan Reference: #${loanId}`;

        res.json({
            status: 'success',
            email: {
                subject: emailSubject,
                body: emailBody,
                to: `${applicantName.toLowerCase().replace(/\s+/g, '.')}@company.com`,
                generated_at: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Generate RFI email error:', error);
        res.status(500).json({ error: 'Failed to generate email', details: error.message });
    }
});

// Get Aggregated Dashboard Stats
app.get('/api/dashboard/stats', (req, res) => {
    const sql = `
        SELECT 
            SUM(amount) as totalAmount,
            AVG(green_score) as avgGreenScore,
            AVG(risk_score) as avgRiskScore,
            COUNT(*) as loanCount,
            AVG(repayment_velocity) as avgRepaymentVelocity,
            AVG(default_probability) as avgDefaultProbability
        FROM loans
    `;
    db.get(sql, [], (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": {
                totalAmount: row.totalAmount || 0,
                avgGreenScore: Math.round(row.avgGreenScore || 0),
                avgRiskScore: Math.round(row.avgRiskScore || 0),
                loanCount: row.loanCount || 0,
                avgRepaymentVelocity: row.avgRepaymentVelocity || 0,
                avgDefaultProbability: row.avgDefaultProbability || 0
            }
        });
    });
});

// Get Global Impact Stats
app.get('/api/impact/global', (req, res) => {
    const sql = `
        SELECT 
            SUM(impact_co2_tonnes) as totalCO2,
            SUM(impact_trees_planted) as totalTrees,
            SUM(impact_energy_kwh) as totalEnergy
        FROM loans
    `;
    db.get(sql, [], (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": {
                totalCO2: row.totalCO2 || 0,
                totalTrees: row.totalTrees || 0,
                totalEnergy: row.totalEnergy || 0
            }
        });
    });
});

// Create a new loan application (and score it) - v2.0 with semantic analysis
app.post('/api/loans', async (req, res) => {
    const loanData = req.body;
    const startTime = Date.now();

    try {
        // 1. Get AI Score with v2.0 semantic analysis
        const aiResult = await aiModule.evaluateLoan(loanData);
        const processingTime = Date.now() - startTime;

        // Calculate impact metrics from semantic analysis
        const semanticScore = aiResult.semantic?.semantic_score || aiResult.green_score;
        const impact_co2 = (semanticScore * 5) + (aiResult.semantic?.quantified_metrics?.carbon_reduction?.value || Math.random() * 50);
        const impact_trees = Math.floor(impact_co2 * 0.5);
        const impact_energy = aiResult.semantic?.quantified_metrics?.energy_capacity?.value * 8760 || impact_co2 * 100; // Annual kWh
        const repayment_vel = 80 + (Math.random() * 20);
        const default_prob = aiResult.risk_score / 2;

        // 2. Save to DB with new fields
        const sql = `INSERT INTO loans (
            applicant_name, amount, purpose, 
            green_score, risk_score, recommendation, roi_projection, 
            status,
            impact_co2_tonnes, impact_trees_planted, impact_energy_kwh,
            repayment_velocity, default_probability,
            reasoning,
            semantic_category, lma_compliant, eu_taxonomy_eligible,
            processing_time_ms, analysis_version
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const params = [
            loanData.applicant_name,
            loanData.amount,
            loanData.purpose,
            aiResult.green_score,
            aiResult.risk_score,
            aiResult.recommendation,
            aiResult.roi_projection,
            'PENDING',
            impact_co2,
            impact_trees,
            impact_energy,
            repayment_vel,
            default_prob,
            aiResult.reasoning || aiResult.explainability?.natural_language || "Automated evaluation.",
            aiResult.semantic?.primary_category?.category || null,
            aiResult.lma_compliance?.compliant ? 1 : 0,
            aiResult.eu_taxonomy?.eligible ? 1 : 0,
            processingTime,
            aiResult.model_version || API_VERSION
        ];

        db.run(sql, params, async function (err) {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }

            const loanId = this.lastID;

            // 3. Log audit trail (async, don't block response)
            if (aiResult.audit_trail) {
                aiResult.audit_trail.application_id = loanId;
                logAuditEntry(aiResult.audit_trail).catch(e => console.error('Audit log error:', e));
            }

            // 4. Log benchmark (async)
            logBenchmark(loanId, {
                total_time_ms: processingTime,
                analysis_source: aiResult.analysis_source,
                used_api_chat: aiResult.analysis_source === 'deepseek_ai',
                manual_hours: 96, // Industry average
                efficiency_multiple: aiResult.processing_time_saved?.efficiency_multiple || 'N/A'
            }).catch(e => console.error('Benchmark log error:', e));

            res.json({
                "message": "success",
                "data": {
                    id: loanId,
                    ...loanData,
                    ...aiResult,
                    status: 'PENDING',
                    impact_co2,
                    impact_trees,
                    processing_time_ms: processingTime
                }
            });
        });
    } catch (e) {
        console.error('Loan creation error:', e);
        res.status(500).json({ error: e.message });
    }
});
// Ledger Endpoint
app.get('/api/ledger', (req, res) => {
    const sql = `
        SELECT t.*, l.applicant_name 
        FROM trades t 
        JOIN loans l ON t.loan_id = l.id 
        ORDER BY t.timestamp DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Invest in a loan (Create Trade)
app.post('/api/invest', (req, res) => {
    const { loan_id, investor_name, amount } = req.body;

    // In a real app, check if loan exists and amount <= remaining needed

    const sql = `INSERT INTO trades (loan_id, investor_name, amount) VALUES (?, ?, ?)`;
    const params = [loan_id, investor_name, amount];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": {
                id: this.lastID,
                loan_id,
                investor_name,
                amount,
                timestamp: new Date().toISOString()
            }
        });
    });
});

// Upload and analyze loan documents
app.post('/api/loans/:id/documents', upload.single('document'), async (req, res) => {
    try {
        if (!documentProcessor) {
            return res.status(503).json({ error: "Document processing is not available on this server" });
        }

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        console.log(`Processing document for loan ${req.params.id}: ${req.file.originalname}`);
        const loanId = req.params.id;
        const result = await documentProcessor.analyzeDocument(req.file.buffer, req.file.mimetype, loanId);

        // Log this analysis to audit log
        logAuditEntry(loanId, 'DOCUMENT_ANALYSIS', 'AI Document Processor',
            `Analyzed uploaded document: ${req.file.originalname} (${result.document_length} chars)`, result);

        res.json({
            message: "success",
            data: result
        });
    } catch (error) {
        console.error("Document processing error:", error);
        res.status(500).json({ error: "Failed to process document: " + error.message });
    }
});

// ==================== ANALYTICS ENDPOINTS ====================

// Market Activity (hourly loan volume for charts)
app.get('/api/analytics/market-activity', (req, res) => {
    // Get loans from last 24 hours, grouped by hour
    const sql = `
        SELECT 
            strftime('%H:00', created_at) as time,
            SUM(amount) as value
        FROM loans 
        WHERE created_at >= datetime('now', '-24 hours')
        GROUP BY strftime('%H', created_at)
        ORDER BY created_at
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        // If no data, provide sensible defaults based on total portfolio
        if (rows.length === 0) {
            db.get("SELECT SUM(amount) as total FROM loans", [], (err2, totals) => {
                const baseValue = (totals?.total || 100000) / 7;
                const defaultData = [
                    { name: '09:00', value: baseValue * 0.8 },
                    { name: '10:00', value: baseValue * 0.6 },
                    { name: '11:00', value: baseValue * 0.4 },
                    { name: '12:00', value: baseValue * 0.5 },
                    { name: '13:00', value: baseValue * 0.35 },
                    { name: '14:00', value: baseValue * 0.55 },
                    { name: '15:00', value: baseValue * 0.75 },
                ];
                res.json({ message: 'success', data: defaultData });
            });
            return;
        }
        res.json({ message: 'success', data: rows.map(r => ({ name: r.time, value: r.value })) });
    });
});

// AI Predictions (derived from portfolio metrics)
app.get('/api/analytics/predictions', (req, res) => {
    const sql = `
        SELECT 
            AVG(green_score) as avgGreen,
            AVG(risk_score) as avgRisk,
            AVG(roi_projection) as avgROI,
            SUM(impact_co2_tonnes) as totalCO2,
            COUNT(*) as loanCount,
            AVG(default_probability) as avgDefault
        FROM loans
    `;
    db.get(sql, [], (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        const data = row || {};
        const predictions = [
            {
                label: "Solar Sector Yield",
                change: `+${((data.avgROI || 8) * 1.2).toFixed(1)}%`,
                type: "positive"
            },
            {
                label: "Portfolio Risk",
                change: `${(data.avgRisk || 25).toFixed(1)}%`,
                type: (data.avgRisk || 25) > 40 ? "warning" : "neutral"
            },
            {
                label: "Green Confidence",
                change: `${(data.avgGreen || 75).toFixed(1)}%`,
                type: "positive"
            },
            {
                label: "Grid Stability",
                change: data.loanCount > 5 ? "Optimal" : "Building",
                type: data.loanCount > 5 ? "positive" : "neutral"
            },
            {
                label: "Carbon Credit Value",
                change: `+${((data.totalCO2 || 0) * 0.02).toFixed(1)}%`,
                type: "positive"
            },
            {
                label: "Default Probability",
                change: `${(data.avgDefault || 5).toFixed(1)}%`,
                type: (data.avgDefault || 5) > 10 ? "warning" : "positive"
            },
        ];
        res.json({ message: 'success', data: predictions });
    });
});

// Portfolio Health
app.get('/api/analytics/portfolio-health', (req, res) => {
    const sql = `
        SELECT 
            AVG(green_score) as avgGreen,
            AVG(risk_score) as avgRisk,
            AVG(repayment_velocity) as avgVelocity,
            AVG(default_probability) as avgDefault,
            COUNT(*) as loanCount
        FROM loans
    `;
    db.get(sql, [], (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        const data = row || {};
        // Health score: weighted combination (high green, high velocity, low risk, low default = good)
        const healthScore = Math.min(100, Math.max(0,
            (data.avgGreen || 50) * 0.3 +
            (data.avgVelocity || 80) * 0.3 +
            (100 - (data.avgRisk || 30)) * 0.2 +
            (100 - (data.avgDefault || 5) * 2) * 0.2
        ));

        res.json({
            message: 'success',
            data: {
                healthScore: healthScore.toFixed(1),
                changeVsLastMonth: '+2.1', // Would need historical data for real calc
                loanCount: data.loanCount || 0
            }
        });
    });
});

// Performance History (repayment velocity, default probability over time)
app.get('/api/analytics/performance', (req, res) => {
    const sql = `
        SELECT 
            strftime('%Y-%m', created_at) as month,
            AVG(repayment_velocity) as avgVelocity,
            AVG(default_probability) as avgDefault
        FROM loans 
        GROUP BY strftime('%Y-%m', created_at)
        ORDER BY month
        LIMIT 12
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        if (rows.length === 0) {
            // Default data if no loans
            res.json({
                message: 'success',
                data: {
                    velocityData: months.slice(0, 6).map((m, i) => ({ month: m, value: 70 + i * 5 })),
                    defaultData: months.map((m, i) => ({ month: `M${i + 1}`, prob: Math.max(0.1, 1.2 - i * 0.1) })),
                    currentDefault: 0.3
                }
            });
            return;
        }

        res.json({
            message: 'success',
            data: {
                velocityData: rows.map(r => ({ month: r.month, value: r.avgVelocity || 80 })),
                defaultData: rows.map((r, i) => ({ month: `M${i + 1}`, prob: r.avgDefault || 0.5 })),
                currentDefault: rows[rows.length - 1]?.avgDefault || 0.3
            }
        });
    });
});

// Impact History (carbon offset by energy type over time)
app.get('/api/analytics/impact-history', (req, res) => {
    // Derive energy types from loan purposes
    const sql = `
        SELECT 
            strftime('%m', created_at) as month,
            SUM(CASE WHEN purpose LIKE '%solar%' THEN impact_co2_tonnes ELSE 0 END) as solar,
            SUM(CASE WHEN purpose LIKE '%wind%' THEN impact_co2_tonnes ELSE 0 END) as wind,
            SUM(CASE WHEN purpose NOT LIKE '%solar%' AND purpose NOT LIKE '%wind%' THEN impact_co2_tonnes ELSE 0 END) as other
        FROM loans 
        GROUP BY strftime('%m', created_at)
        ORDER BY month
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        const labels = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

        if (rows.length === 0) {
            // Default progression data
            res.json({
                message: 'success',
                data: {
                    labels: labels.slice(0, 9),
                    solar: [30, 45, 50, 60, 70, 75, 80, 85, 90],
                    wind: [20, 25, 35, 40, 45, 55, 60, 65, 70],
                    hydro: [10, 15, 20, 25, 30, 35, 40, 45, 50]
                }
            });
            return;
        }

        res.json({
            message: 'success',
            data: {
                labels: rows.map(r => labels[parseInt(r.month) - 1] || r.month),
                solar: rows.map(r => r.solar || 0),
                wind: rows.map(r => r.wind || 0),
                hydro: rows.map(r => r.other || 0)
            }
        });
    });
});

// Social Impact Metrics
app.get('/api/analytics/social-impact', (req, res) => {
    const sql = `
        SELECT 
            AVG(green_score) as avgGreen,
            SUM(impact_trees_planted) as totalTrees,
            SUM(impact_energy_kwh) as totalEnergy,
            COUNT(*) as loanCount,
            SUM(amount) as totalInvested
        FROM loans
    `;
    db.get(sql, [], (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        const data = row || {};
        // Derive social metrics from loan data
        const communityScore = Math.min(100, (data.loanCount || 0) * 10 + 50);
        const educationScore = Math.min(100, (data.avgGreen || 50) * 0.8 + 20);
        const jobsScore = Math.min(100, ((data.totalInvested || 0) / 10000) + 40);
        const healthScore = Math.min(100, ((data.totalTrees || 0) * 0.5) + 30);
        const sustainScore = Math.min(100, (data.avgGreen || 50) + 20);

        res.json({
            message: 'success',
            data: [
                { metric: "Community", impact: Math.round(communityScore), benchmark: 60 },
                { metric: "Education", impact: Math.round(educationScore), benchmark: 50 },
                { metric: "Jobs", impact: Math.round(jobsScore), benchmark: 60 },
                { metric: "Health", impact: Math.round(healthScore), benchmark: 40 },
                { metric: "Sustainability", impact: Math.round(sustainScore), benchmark: 70 },
            ]
        });
    });
});

// Loan Aging Distribution
app.get('/api/analytics/loan-aging', (req, res) => {
    const sql = `
        SELECT 
            id,
            julianday('now') - julianday(created_at) as age_days,
            green_score,
            risk_score
        FROM loans
        ORDER BY created_at
        LIMIT 48
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        if (rows.length === 0) {
            // Generate placeholder data
            const data = Array.from({ length: 48 }, (_, i) => ({
                loanId: 1000 + i,
                intensity: Math.floor(Math.random() * 4)
            }));
            res.json({ message: 'success', data });
            return;
        }

        // Map age to intensity (0-3): 0=new, 3=old
        const maxAge = Math.max(...rows.map(r => r.age_days), 1);
        const data = rows.map(r => ({
            loanId: r.id,
            intensity: Math.min(3, Math.floor((r.age_days / maxAge) * 4)),
            greenScore: r.green_score,
            riskScore: r.risk_score
        }));

        // Pad to 48 if needed
        while (data.length < 48) {
            data.push({ loanId: null, intensity: 0 });
        }

        res.json({ message: 'success', data: data.slice(0, 48) });
    });
});

// User Profile Stats
app.get('/api/user/profile', (req, res) => {
    const sql = `
        SELECT 
            COUNT(*) as loansProcessed,
            AVG(green_score) as avgGreenScore,
            SUM(amount) as totalInvested
        FROM loans
    `;
    db.get(sql, [], (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        const data = row || {};
        // Estimate hours saved: ~2 hours per loan with AI vs manual
        const hoursSaved = (data.loansProcessed || 0) * 2;

        res.json({
            message: 'success',
            data: {
                name: "Alex Anderson",
                role: "Senior Loan Officer",
                joinedYear: 2023,
                loansProcessed: data.loansProcessed || 0,
                avgGreenScore: Math.round(data.avgGreenScore || 0),
                hoursSaved: hoursSaved
            }
        });
    });
});

// ==================== TEAM MANAGEMENT ENDPOINTS ====================

// Get Team
app.get('/api/team', (req, res) => {
    const sql = "SELECT * FROM team_members ORDER BY created_at DESC";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'success', data: rows });
    });
});

// Invite Member
app.post('/api/team/invite', (req, res) => {
    const { name, role, email, access = 'Viewer' } = req.body;
    const avatar = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const sql = `INSERT INTO team_members (name, role, email, access, status, avatar) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [name, role, email, access, 'Active', avatar];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: {
                id: this.lastID,
                name, role, email, access, status: 'Active', avatar
            }
        });
    });
});

// Remove Member
app.delete('/api/team/:id', (req, res) => {
    const sql = "DELETE FROM team_members WHERE id = ?";
    db.run(sql, req.params.id, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'success', deleted: this.changes });
    });
});

// ==================== BENCHMARK ENDPOINTS (NEW v2.0) ====================

// Get Processing Benchmarks
app.get('/api/benchmarks', async (req, res) => {
    try {
        const stats = await getBenchmarkStats();

        // Calculate time saved comparison
        const avgProcessingSeconds = (stats.avg_processing_ms || 1000) / 1000;
        const manualHours = 96; // Industry average for green loan review
        const automatedHours = avgProcessingSeconds / 3600;
        const timeSavedPercent = ((manualHours - automatedHours) / manualHours * 100).toFixed(2);

        res.json({
            message: 'success',
            data: {
                total_loans_processed: stats.total_processed || 0,
                average_processing_ms: Math.round(stats.avg_processing_ms || 0),
                min_processing_ms: stats.min_processing_ms || 0,
                max_processing_ms: stats.max_processing_ms || 0,
                total_manual_hours_saved: Math.round(stats.total_manual_hours_saved || 0),
                comparison: {
                    automated_seconds: avgProcessingSeconds.toFixed(2),
                    manual_estimate_hours: manualHours,
                    time_saved_percent: timeSavedPercent + '%',
                    efficiency_multiple: Math.round(manualHours * 3600 / (stats.avg_processing_ms / 1000 || 1)) + 'x'
                },
                api_usage: {
                    with_api_avg_ms: Math.round(stats.avg_with_api || 0),
                    without_api_avg_ms: Math.round(stats.avg_without_api || 0)
                }
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Audit Trail for a specific loan
app.get('/api/loans/:id/audit', (req, res) => {
    const sql = "SELECT * FROM audit_log WHERE loan_id = ? ORDER BY created_at DESC";
    db.all(sql, [req.params.id], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        // Parse JSON fields
        const parsed = rows.map(row => ({
            ...row,
            attribution: row.attribution_json ? JSON.parse(row.attribution_json) : null,
            evidence: row.evidence_json ? JSON.parse(row.evidence_json) : null
        }));
        res.json({ message: 'success', data: parsed });
    });
});

// Get Explainability for a loan (from latest audit)
app.get('/api/loans/:id/explainability', (req, res) => {
    const sql = "SELECT * FROM audit_log WHERE loan_id = ? ORDER BY created_at DESC LIMIT 1";
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'No audit data found for this loan' });
            return;
        }
        res.json({
            message: 'success',
            data: {
                loan_id: row.loan_id,
                green_score: row.green_score,
                recommendation: row.recommendation,
                attribution: row.attribution_json ? JSON.parse(row.attribution_json) : null,
                evidence: row.evidence_json ? JSON.parse(row.evidence_json) : null,
                confidence: row.confidence_level,
                processing_time_ms: row.processing_time_ms,
                model_version: row.model_version
            }
        });
    });
});

// API Info endpoint
app.get('/api/info', (req, res) => {
    res.json({
        name: 'VerdeScore API',
        version: API_VERSION,
        capabilities: [
            'Semantic loan analysis using embeddings',
            'LMA Green Loan Principles compliance scoring',
            'EU Taxonomy eligibility with quantitative TSC validation',
            'Greenwashing risk detection',
            'Explainable AI with feature attribution',
            'Audit trail for regulatory compliance',
            'Processing time benchmarks'
        ],
        endpoints: {
            loans: '/api/loans',
            benchmarks: '/api/benchmarks',
            audit: '/api/loans/:id/audit',
            explainability: '/api/loans/:id/explainability'
        }
    });
});

// ==================== SERVE FRONTEND (Production) ====================
const path = require('path');
const frontendPath = path.join(__dirname, '../frontend/dist');

// Serve static files from frontend build
app.use(express.static(frontendPath));

// SPA catch-all - send all non-API routes to index.html
// Express 5 requires named parameter, not wildcard
app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});


app.listen(PORT, () => {
    console.log(`VerdeScore API v${API_VERSION} running on http://localhost:${PORT}`);
    console.log(`Frontend served from: ${frontendPath}`);
});

