#!/usr/bin/env node
/**
 * VerdeScore Production Seeding Script
 * 
 * Seeds the Railway production deployment with demo loan data via HTTP API.
 * 
 * Usage:
 *   node scripts/seed-production.js
 *   node scripts/seed-production.js --url https://custom-url.railway.app
 */

const PRODUCTION_URL = process.argv.includes('--url')
    ? process.argv[process.argv.indexOf('--url') + 1]
    : 'https://verdescore-production.up.railway.app';

const API_BASE = `${PRODUCTION_URL}/api`;

// Demo loans with diverse scenarios
const demoLoans = [
    {
        applicant: "SolarTech Innovations Ltd",
        amount: 5000000,
        purpose: "Installation of 50 MW solar photovoltaic farm in Southern Spain with advanced tracking technology. Project will generate 80,000 MWh annually, displacing 43,800 tonnes of CO2. LEED Platinum certified facility with ISO 14001 environmental management.",
        category: "Renewable Energy"
    },
    {
        applicant: "Nordic Wind Partners",
        amount: 12000000,
        purpose: "Construction of 25 MW offshore wind turbine array in the North Sea. Expected capacity factor of 45%, generating clean energy for 15,000 homes. EU Taxonomy aligned with climate change mitigation objectives.",
        category: "Wind Energy"
    },
    {
        applicant: "GreenBuild Development Corp",
        amount: 3500000,
        purpose: "Deep retrofit of 50-year-old commercial building achieving 45% energy reduction. Installing high-efficiency HVAC, LED lighting, and smart building management. Targeting BREEAM Outstanding certification.",
        category: "Green Buildings"
    },
    {
        applicant: "EcoTransport Solutions",
        amount: 8000000,
        purpose: "Fleet electrification project converting 200 diesel buses to electric vehicles. Installing 50 fast-charging stations across metropolitan area. Projected 12,000 tonnes CO2 reduction annually.",
        category: "Clean Transportation"
    },
    {
        applicant: "AquaPure Technologies",
        amount: 2200000,
        purpose: "Advanced wastewater treatment facility upgrade using membrane bioreactor technology. Will reduce energy consumption by 30% while improving effluent quality to EU Bathing Water standards.",
        category: "Water Management"
    },
    {
        applicant: "CircularPack Industries",
        amount: 1800000,
        purpose: "Plastic recycling facility expansion with chemical recycling capabilities. Will process 50,000 tonnes of mixed plastic waste annually, achieving 90% recycling rate.",
        category: "Circular Economy"
    },
    {
        applicant: "UrbanForest Initiative",
        amount: 900000,
        purpose: "Urban reforestation project planting 100,000 native trees across 500 hectares. Carbon sequestration of 5,000 tonnes CO2 annually. Includes biodiversity corridor restoration.",
        category: "Nature Conservation"
    },
    {
        applicant: "SmartGrid Energy Systems",
        amount: 4500000,
        purpose: "Grid-scale battery storage installation (100 MWh capacity) for renewable energy integration. Lithium-ion technology with 15-year warranty. Enables 30% more renewable energy dispatch.",
        category: "Energy Storage"
    },
    {
        applicant: "AgriGreen Sustainable Farms",
        amount: 1500000,
        purpose: "Precision agriculture implementation across 2,000 hectares. IoT sensors, drone monitoring, and AI-driven irrigation reducing water usage by 40% and fertilizer by 35%.",
        category: "Sustainable Agriculture"
    },
    {
        applicant: "HydroPower Renewables",
        amount: 7500000,
        purpose: "Small-scale run-of-river hydroelectric project (15 MW capacity). Minimal environmental impact with fish-friendly turbines. Will power 8,000 homes with baseload renewable energy.",
        category: "Hydropower"
    }
];

async function submitLoan(loan) {
    try {
        const response = await fetch(`${API_BASE}/loans`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loan)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        throw error;
    }
}

async function checkHealth() {
    try {
        const response = await fetch(`${API_BASE}/info`);
        if (!response.ok) {
            throw new Error(`Health check failed: ${response.status}`);
        }
        const info = await response.json();
        console.log('✅ API is healthy:', info);
        return true;
    } catch (error) {
        console.error('❌ API health check failed:', error.message);
        return false;
    }
}

async function seedProduction() {
    console.log('🌱 VerdeScore Production Seeder');
    console.log('================================');
    console.log(`Target: ${PRODUCTION_URL}`);
    console.log('');

    // Health check first
    console.log('🔍 Checking API health...');
    const healthy = await checkHealth();
    if (!healthy) {
        console.error('❌ Cannot proceed - API is not responding');
        process.exit(1);
    }
    console.log('');

    // Submit each loan
    console.log(`📤 Submitting ${demoLoans.length} demo loans...\n`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < demoLoans.length; i++) {
        const loan = demoLoans[i];
        process.stdout.write(`[${i + 1}/${demoLoans.length}] ${loan.applicant.padEnd(30)} `);

        try {
            const result = await submitLoan(loan);
            console.log(`✅ Score: ${result.green_score || result.greenScore || 'N/A'}`);
            successCount++;

            // Small delay to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.log(`❌ ${error.message}`);
            failCount++;
        }
    }

    console.log('\n================================');
    console.log(`✅ Successfully seeded: ${successCount}/${demoLoans.length}`);
    if (failCount > 0) {
        console.log(`❌ Failed: ${failCount}`);
    }
    console.log(`\n🌐 View at: ${PRODUCTION_URL}/dashboard`);
}

// Run the seeder
seedProduction().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
