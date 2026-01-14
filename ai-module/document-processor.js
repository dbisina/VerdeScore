/**
 * Document Processor Module
 * Handles parsing of uploaded documents (PDF) and semantic analysis of their content.
 */

const pdf = require('pdf-parse');
const { performSemanticEvaluation, extractQuantifiedMetrics } = require('./semantic-analyzer');
const { logAuditEntry } = require('../backend/database'); // We might need this, or server handles logging

/**
 * Extract text from PDF buffer
 * @param {Buffer} dataBuffer - The uploaded file buffer
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromPDF(dataBuffer) {
    try {
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (error) {
        console.error("PDF Parsing Error:", error);
        throw new Error("Failed to parse PDF document");
    }
}

/**
 * Analyze a document for green loan evidence and metrics
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} mimeType - e.g. 'application/pdf'
 * @param {number|string} loanId - Associated loan ID
 */
async function analyzeDocument(fileBuffer, mimeType, loanId) {
    // 1. Extract Text
    let fullText = '';
    if (mimeType === 'application/pdf') {
        fullText = await extractTextFromPDF(fileBuffer);
    } else {
        // Fallback for text/plain
        fullText = fileBuffer.toString('utf-8');
    }

    // Clean text (remove excessive newlines/spaces)
    const cleanText = fullText.replace(/\s+/g, ' ').trim();

    // Limit context for analysis (first 5000 chars - executive summary usually at start)
    const analysisContext = cleanText.substring(0, 5000);

    // 2. Perform Semantic Analysis on the document content
    // We treat the document text as a detailed "purpose" description
    const semanticResult = await performSemanticEvaluation({
        purpose: analysisContext,
        amount: 0 // Amount might not be in the doc or parsed easily, so we skip amount-based logic if any
    });

    // 3. Extract specific evidence keywords
    const evidenceKeywords = ['certificate', 'iso 14001', 'leed', 'breeam', 'impact report', 'audit', 'emissions report'];
    const foundEvidence = evidenceKeywords.filter(kw => cleanText.toLowerCase().includes(kw));

    // 4. Extract Quantified Metrics (using the full text if possible, or context)
    // We use the same extractor from semantic-analyzer
    const extractedMetrics = extractQuantifiedMetrics(cleanText.substring(0, 10000));

    return {
        success: true,
        document_length: cleanText.length,
        semantic_score: semanticResult.final_green_score,
        primary_category: semanticResult.primary_category,
        evidence_found: foundEvidence,
        metrics: extractedMetrics,
        excerpt: analysisContext.substring(0, 200) + "..."
    };
}

module.exports = {
    analyzeDocument,
    extractTextFromPDF
};
