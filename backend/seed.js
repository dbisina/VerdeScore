const db = require('./database');

const loans = [
    {
        applicant_name: "EcoHarvest Solar Expansion",
        amount: 2500000,
        purpose: "Expand solar farm capacity by 5MW with new panel technology",
        green_score: 92,
        risk_score: 15,
        recommendation: "Strongly Fund",
        roi_projection: 7.5,
        status: "APPROVED",
        impact_co2_tonnes: 1200,
        impact_trees_planted: 5000,
        impact_energy_kwh: 5000000,
        repayment_velocity: 88,
        default_probability: 1.2,
        reasoning: "High-yield solar expansion with proven technology. Aligns perfectly with regional renewable targets. Low implementation risk."
    },
    {
        applicant_name: "BlueWind Offshore Turbine",
        amount: 5000000,
        purpose: "Install 2 new offshore wind turbines for coastal energy supply",
        green_score: 88,
        risk_score: 25,
        recommendation: "Strongly Fund",
        roi_projection: 8.2,
        status: "PENDING",
        impact_co2_tonnes: 3500,
        impact_trees_planted: 12000,
        impact_energy_kwh: 12000000,
        repayment_velocity: 75,
        default_probability: 3.5,
        reasoning: "Offshore wind has high energy potential but moderate construction risks. Environmental impact is extremely positive."
    },
    {
        applicant_name: "Urban Vertical Gardens",
        amount: 750000,
        purpose: "Construct hydroponic vertical farms in downtown metro area",
        green_score: 75,
        risk_score: 45,
        recommendation: "Consider Funding",
        roi_projection: 6.0,
        status: "PENDING",
        impact_co2_tonnes: 150,
        impact_trees_planted: 800,
        impact_energy_kwh: 50000,
        repayment_velocity: 60,
        default_probability: 8.0,
        reasoning: "Innovative urban agriculture reduces food transport emissions. Business model is relatively new, posing moderate market risk."
    },
    {
        applicant_name: "CleanCoal Transition Tech",
        amount: 1200000,
        purpose: "Retrofit aging coal plant with carbon capture systems",
        green_score: 45,
        risk_score: 65,
        recommendation: "Review Manually",
        roi_projection: 4.5,
        status: "REJECTED",
        impact_co2_tonnes: 50,
        impact_trees_planted: 0,
        impact_energy_kwh: 0,
        repayment_velocity: 40,
        default_probability: 15.0,
        reasoning: "Coal-based projects face regulatory headwinds. Carbon capture efficiency is unproven at this scale."
    },
    {
        applicant_name: "OceanTide Global",
        amount: 3200000,
        purpose: "Pilot tidal energy wave generators in Pacific region",
        green_score: 85,
        risk_score: 55,
        recommendation: "Consider Funding",
        roi_projection: 9.5,
        status: "PENDING",
        impact_co2_tonnes: 900,
        impact_trees_planted: 3000,
        impact_energy_kwh: 450000,
        repayment_velocity: 50,
        default_probability: 12.5,
        reasoning: "Tidal energy is a promising frontier. Technology is in early stages, carrying higher R&D risk but significant upside."
    }
];

db.serialize(() => {
    // 1. Clear existing data
    console.log("Clearing existing data...");
    db.run("DELETE FROM loans");
    db.run("DELETE FROM trades");

    // 2. Insert new loans
    const stmt = db.prepare(`INSERT INTO loans (
        applicant_name, amount, purpose, 
        green_score, risk_score, recommendation, roi_projection, 
        status,
        impact_co2_tonnes, impact_trees_planted, impact_energy_kwh,
        repayment_velocity, default_probability,
        reasoning
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    console.log("Seeding loans... with reasoning");
    loans.forEach(loan => {
        stmt.run(
            loan.applicant_name,
            loan.amount,
            loan.purpose,
            loan.green_score,
            loan.risk_score,
            loan.recommendation,
            loan.roi_projection,
            loan.status,
            loan.impact_co2_tonnes,
            loan.impact_trees_planted,
            loan.impact_energy_kwh,
            loan.repayment_velocity,
            loan.default_probability,
            loan.reasoning
        );
    });

    stmt.finalize();
    console.log("Database seeded successfully!");
});
