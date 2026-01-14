// Using native fetch

async function testReasoning() {
    console.log("Testing Loan Creation with Reasoning...");
    const loan = {
        applicant_name: "Test Solar Corp",
        amount: 1000000,
        purpose: "We are building a massive solar farm to power 500 homes."
    };

    try {
        // 1. Create Loan
        const response = await fetch('http://localhost:3001/api/loans', {
            method: 'POST',
            body: JSON.stringify(loan),
            headers: { 'Content-Type': 'application/json' }
        });
        const result = await response.json();

        console.log("Creation Response:", result);

        if (result.data && result.data.reasoning && result.data.reasoning.includes("Solar")) {
            console.log("\n[SUCCESS] Reasoning verified:", result.data.reasoning);
        } else {
            console.error("\n[FAILURE] Reasoning missing or incorrect.");
        }

    } catch (e) {
        console.error("Test Failed:", e);
    }
}

testReasoning();
