async function run() {
    const base = 'http://localhost:3001/api';

    try {
        // 1. Create Loan
        console.log("1. Creating Loan...");
        const loanRes = await fetch(`${base}/loans`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ applicant_name: "Test Solar", amount: 50000, purpose: "Solar Farm" })
        });
        if (!loanRes.ok) throw new Error(`Loan creation failed: ${loanRes.statusText}`);
        const loan = await loanRes.json();
        console.log("   Loan Created:", loan.data.id, "Green Score:", loan.data.green_score);
        const loanId = loan.data.id;

        // 2. List Loans
        console.log("2. Listing Loans...");
        const listRes = await fetch(`${base}/loans`);
        const list = await listRes.json();
        console.log("   Loans Found:", list.data.length);

        // 3. Invest
        console.log("3. Investing...");
        const investRes = await fetch(`${base}/invest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ loan_id: loanId, investor_name: "Green Fund A", amount: 10000 })
        });
        const invest = await investRes.json();
        console.log("   Investment Result:", invest.message);

        // 4. Ledger
        console.log("4. Checking Ledger...");
        const ledgerRes = await fetch(`${base}/ledger`);
        const ledger = await ledgerRes.json();
        console.log("   Ledger Count:", ledger.data.length);
        console.log("   Latest Entry:", ledger.data[0].investor_name, "invested", ledger.data[0].amount);

        // 5. Dashboard Stats (Lender Edition)
        console.log("5. Checking Dashboard Stats...");
        const statsRes = await fetch(`${base}/dashboard/stats`);
        if (!statsRes.ok) throw new Error(`Dashboard Stats failed: ${statsRes.statusText}`);
        const stats = await statsRes.json();
        console.log("   Total Investment:", stats.data.totalAmount);
        console.log("   Avg Green Score:", stats.data.avgGreenScore);

        // 6. Global Impact (Lender Edition)
        console.log("6. Checking Global Impact...");
        const impactRes = await fetch(`${base}/impact/global`);
        if (!impactRes.ok) throw new Error(`Global Impact failed: ${impactRes.statusText}`);
        const impact = await impactRes.json();
        console.log("   Total CO2 Offset:", impact.data.totalCO2);
        console.log("   Trees Planted:", impact.data.totalTrees);

        console.log("VERIFICATION SUCCESSFUL");
    } catch (e) {
        console.error("VERIFICATION FAILED:", e);
        process.exit(1);
    }
}

run();
