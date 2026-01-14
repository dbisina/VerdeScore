require('dotenv').config();
const { evaluateLoan } = require('../ai-module/index.js'); // Adjust path as needed

async function testDirect() {
    console.log("Testing AI Module Direct...");
    console.log("DeepSeek Key in Env:", process.env.DeepSeek_API_KEY ? "Present" : "Missing");

    const loan = {
        applicant_name: "Direct Test",
        amount: 50000,
        purpose: "Small solar installation"
    };

    const result = await evaluateLoan(loan);
    console.log("Result Reasoning:", result.reasoning);
}

testDirect();
