/**
 * Comprehensive Test for v2.0 Semantic AI Module
 * Tests semantic analysis, explainability, and benchmark tracking
 */

async function runTests() {
    const base = 'http://localhost:3001/api';
    const results = { passed: 0, failed: 0, tests: [] };

    function log(test, passed, details) {
        results.tests.push({ test, passed, details });
        if (passed) results.passed++;
        else results.failed++;
        console.log(passed ? '✓' : '✗', test, details ? `- ${details}` : '');
    }

    try {
        // Test 1: API Info endpoint
        console.log('\n=== API Info ===');
        const infoRes = await fetch(`${base}/info`);
        const info = await infoRes.json();
        log('API Info returns version', info.version === '2.0.0-semantic', info.version);
        log('API has new capabilities', info.capabilities?.length >= 5, `${info.capabilities?.length} capabilities`);

        // Test 2: Create a HIGH quality green loan (should score high)
        console.log('\n=== High-Quality Green Loan ===');
        const highQualityLoan = await fetch(`${base}/loans`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                applicant_name: "SolarMax Energy Corp",
                amount: 5000000,
                purpose: "Installation of 50 MW solar photovoltaic power plant in Arizona. Expected to generate 87,600 MWh annually, reducing 43,800 tonnes CO2 per year. LEED Gold certified facility. Project timeline: 18 months. Third-party verified by DNV."
            })
        });
        const highLoan = await highQualityLoan.json();
        const highData = highLoan.data;

        log('High-quality loan created', highLoan.message === 'success', `ID: ${highData?.id}`);
        log('Semantic analysis present', !!highData?.semantic, highData?.semantic?.analysis_method);
        log('Green score >= 70', highData?.green_score >= 70, `Score: ${highData?.green_score}`);
        log('LMA compliant', highData?.lma_compliance?.compliant === true, `GLP: ${highData?.lma_compliance?.score}`);
        log('EU Taxonomy eligible', highData?.eu_taxonomy?.eligible === true, `Score: ${highData?.eu_taxonomy?.score}`);
        log('Has explainability', !!highData?.explainability?.attribution, `Factors: ${highData?.explainability?.attribution?.attributions?.length}`);
        log('Processing time recorded', highData?.processing_time_ms > 0, `${highData?.processing_time_ms}ms`);
        log('Quantified metrics extracted', Object.keys(highData?.semantic?.quantified_metrics || {}).length > 0,
            JSON.stringify(highData?.semantic?.quantified_metrics || {}));

        // Test 3: Create a VAGUE green loan (should score lower, flag greenwashing)
        console.log('\n=== Vague Green Loan (Greenwashing Risk) ===');
        const vagueLoan = await fetch(`${base}/loans`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                applicant_name: "EcoFriendly Solutions",
                amount: 2000000,
                purpose: "We plan to implement sustainable green eco-friendly solutions for a cleaner tomorrow. Our company is committed to carbon neutrality and will offset emissions through future initiatives."
            })
        });
        const vagueData = (await vagueLoan.json()).data;

        log('Vague loan created', !!vagueData?.id, `ID: ${vagueData?.id}`);
        log('Green score < high loan', vagueData?.green_score < highData?.green_score,
            `Vague: ${vagueData?.green_score} vs High: ${highData?.green_score}`);
        log('Greenwashing flagged', vagueData?.greenwashing_risk?.risk_level !== 'LOW',
            `Risk: ${vagueData?.greenwashing_risk?.risk_level}`);
        log('Has improvement suggestions', vagueData?.explainability?.improvement_suggestions?.length > 0,
            `${vagueData?.explainability?.improvement_suggestions?.length} suggestions`);

        // Test 4: Non-green loan (should score very low)
        console.log('\n=== Non-Green Loan ===');
        const brownLoan = await fetch(`${base}/loans`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                applicant_name: "General Industries Inc",
                amount: 3000000,
                purpose: "Business expansion and general capital expenditure for warehouse operations."
            })
        });
        const brownData = (await brownLoan.json()).data;

        log('Non-green loan processed', !!brownData?.id, `ID: ${brownData?.id}`);
        log('Green score is low', brownData?.green_score < 50, `Score: ${brownData?.green_score}`);
        log('Not LMA compliant', brownData?.lma_compliance?.compliant === false);
        log('Not EU Taxonomy eligible', brownData?.eu_taxonomy?.eligible === false);

        // Test 5: Semantic differentiation (solar vs wind should match different categories)
        console.log('\n=== Semantic Differentiation ===');
        log('Solar matches solar category',
            highData?.semantic?.primary_category?.category?.includes('solar') ||
            highData?.semantic?.primary_category?.category?.includes('renewable'),
            highData?.semantic?.primary_category?.category);

        // Test 6: Benchmarks endpoint
        console.log('\n=== Benchmark Tracking ===');
        const benchRes = await fetch(`${base}/benchmarks`);
        const benchmarks = await benchRes.json();
        log('Benchmarks endpoint works', benchmarks.message === 'success');
        log('Loans processed tracked', benchmarks.data?.total_loans_processed >= 3,
            `${benchmarks.data?.total_loans_processed} loans`);
        log('Efficiency multiple calculated', !!benchmarks.data?.comparison?.efficiency_multiple,
            benchmarks.data?.comparison?.efficiency_multiple);

        // Test 7: Audit trail
        console.log('\n=== Audit Trail ===');
        const auditRes = await fetch(`${base}/loans/${highData.id}/audit`);
        const audit = await auditRes.json();
        log('Audit trail exists', audit.data?.length > 0 || audit.message === 'success');

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log(`RESULTS: ${results.passed}/${results.passed + results.failed} tests passed`);
        if (results.failed > 0) {
            console.log('\nFailed tests:');
            results.tests.filter(t => !t.passed).forEach(t => console.log('  -', t.test, t.details));
        }

        // Key metrics
        console.log('\n=== KEY METRICS ===');
        console.log(`High-quality loan score: ${highData?.green_score}/100`);
        console.log(`Vague loan score: ${vagueData?.green_score}/100 (delta: ${highData?.green_score - vagueData?.green_score})`);
        console.log(`Non-green loan score: ${brownData?.green_score}/100`);
        console.log(`Avg processing time: ${benchmarks.data?.average_processing_ms}ms`);
        console.log(`Efficiency: ${benchmarks.data?.comparison?.efficiency_multiple}`);

    } catch (e) {
        console.error('Test error:', e);
        process.exit(1);
    }
}

runTests();
