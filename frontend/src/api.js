// In production (same origin), use relative path. In dev, use localhost:3001
const API_BASE = import.meta.env.VITE_API_URL || (window.location.port === '5173' ? 'http://localhost:3001/api' : '/api');

export const fetchLoans = async () => {
    try {
        const res = await fetch(`${API_BASE}/loans`);
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch loans:", error);
        return { data: [] }; // Return empty structure on failure
    }
};

export const createLoan = async (data) => {
    try {
        const res = await fetch(`${API_BASE}/loans`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch (error) {
        console.error("Failed to create loan:", error);
        throw error;
    }
};
// ... existing code ...

export const fetchDashboardStats = async () => {
    try {
        const res = await fetch(`${API_BASE}/dashboard/stats`);
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        return { data: {} };
    }
};

export const fetchGlobalImpact = async () => {
    try {
        const res = await fetch(`${API_BASE}/impact/global`);
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch global impact:", error);
        return { data: {} };
    }
};

// Analytics API Functions
export const fetchMarketActivity = async () => {
    try {
        const res = await fetch(`${API_BASE}/analytics/market-activity`);
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch market activity:", error);
        return { data: [] };
    }
};

export const fetchPredictions = async () => {
    try {
        const res = await fetch(`${API_BASE}/analytics/predictions`);
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch predictions:", error);
        return { data: [] };
    }
};

export const fetchPortfolioHealth = async () => {
    try {
        const res = await fetch(`${API_BASE}/analytics/portfolio-health`);
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch portfolio health:", error);
        return { data: {} };
    }
};

export const fetchPerformance = async () => {
    try {
        const res = await fetch(`${API_BASE}/analytics/performance`);
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch performance:", error);
        return { data: {} };
    }
};

export const fetchImpactHistory = async () => {
    try {
        const res = await fetch(`${API_BASE}/analytics/impact-history`);
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch impact history:", error);
        return { data: {} };
    }
};

export const fetchSocialImpact = async () => {
    try {
        const res = await fetch(`${API_BASE}/analytics/social-impact`);
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch social impact:", error);
        return { data: [] };
    }
};

export const fetchLoanAging = async () => {
    try {
        const res = await fetch(`${API_BASE}/analytics/loan-aging`);
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch loan aging:", error);
        return { data: [] };
    }
};

export const fetchUserProfile = async () => {
    try {
        const res = await fetch(`${API_BASE}/user/profile`);
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch user profile:", error);
        return { data: {} };
    }
};

export const fetchLedger = async () => {
    try {
        const res = await fetch(`${API_BASE}/ledger`);
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch ledger:", error);
        return { data: [] };
    }
};



export const fetchLoanExplainability = async (id) => {
    try {
        const res = await fetch(`${API_BASE}/loans/${id}/explainability`);
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch loan explainability:", error);
        return { data: {} };
    }
};

export const fetchDeepAnalysis = async (id) => {
    try {
        const res = await fetch(`${API_BASE}/loans/${id}/deep-analysis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch deep analysis:", error);
        throw error;
    }
};

export const fetchBenchmarks = async () => {
    try {
        const res = await fetch(`${API_BASE}/benchmarks`);
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch benchmarks:", error);
        return { data: {} };
    }
};

export const uploadLoanDocument = async (id, file) => {
    try {
        const formData = new FormData();
        formData.append('document', file);

        const res = await fetch(`${API_BASE}/loans/${id}/documents`, {
            method: 'POST',
            body: formData
            // No Content-Type header; fetch sets it automatically with boundary for FormData
        });

        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch (error) {
        console.error("Failed to upload document:", error);
        throw error;
    }
};

export const fetchTeam = async () => {
    try {
        const res = await fetch(`${API_BASE}/team`);
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch team:", error);
        return { data: [] };
    }
};

export const inviteTeamMember = async (memberData) => {
    try {
        const res = await fetch(`${API_BASE}/team/invite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(memberData)
        });
        return await res.json();
    } catch (error) {
        console.error("Failed to invite member:", error);
        return { message: "error" };
    }
};

export const deleteTeamMember = async (id) => {
    try {
        const res = await fetch(`${API_BASE}/team/${id}`, {
            method: 'DELETE'
        });
        return await res.json();
    } catch (error) {
        console.error("Failed to delete member:", error);
        return { message: "error" };
    }
};

export const generateRFIEmail = async (loanId, gaps) => {
    try {
        const res = await fetch(`${API_BASE}/loans/${loanId}/generate-rfi-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gaps })
        });
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch (error) {
        console.error("Failed to generate RFI email:", error);
        throw error;
    }
};
