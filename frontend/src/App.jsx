import React from 'react'
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { LayoutDashboard, Leaf, LineChart, FileText } from 'lucide-react'
import Dashboard from './components/Dashboard'
import LoanList from './components/LoanList'
import NewLoanForm from './components/NewLoanForm'
import ReportingPage from './components/ReportingPage'
import SearchPage from './components/SearchPage'
import ProfilePage from './components/ProfilePage'
import SettingsPage from './components/SettingsPage'
import LoanDetailsPage from './components/LoanDetailsPage'
import ImpactPage from './components/ImpactPage'
import MinimalistDock from './components/ui/minimal-dock'
import LandingHero from './components/LandingHero'
import { EfficiencyBadge } from './components/lender/EfficiencyMetrics'
import TeamManagement from './components/TeamManagement'

import { AnimatePresence, motion } from 'framer-motion'
import { NotificationProvider } from './context/NotificationContext'
import { ThemeProvider } from './context/ThemeContext'

import LiveTicker from './components/LiveTicker'

function App() {
    return (
        <ThemeProvider>
            <NotificationProvider>
                <Router>
                    <div className="flex w-screen h-screen bg-gradient-to-br from-primary via-bg-dark to-[#222222] text-white overflow-hidden font-sans relative">

                        {/* Main Content Area - Full Width */}
                        <main className="flex-1 flex flex-col relative overflow-hidden pb-24">
                            <LiveTicker />
                            {/* Top Bar */}
                            <header className="h-24 flex items-center justify-between px-10 pt-4 z-10 shrink-0">
                                <div className="flex items-center gap-3 text-secondary">
                                    <img src="/logo.png" alt="VerdeScore" className="w-24 h-24 object-contain" />
                                    <span className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">
                                        VerdeScore
                                    </span>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium">
                                        <div className="w-2 h-2 rounded-full bg-secondary animate-[pulse_2s_infinite]" />
                                        <span>Verde AI: Online</span>
                                    </div>
                                </div>
                            </header>

                            {/* Scrollable Content */}
                            <div className="flex-1 px-10 pb-8 overflow-y-auto scrollbar-none">
                                <Routes>
                                    <Route path="/" element={<DashboardHome />} />
                                    <Route path="/loans" element={<LoansPage />} />
                                    <Route path="/impact" element={<ImpactPage />} />
                                    <Route path="/reports" element={<ReportingPage />} />
                                    <Route path="/search" element={<SearchPage />} />
                                    <Route path="/profile" element={<ProfilePage />} />
                                    <Route path="/settings" element={<SettingsPage />} />
                                    <Route path="/loan/:id" element={<LoanDetailsPage />} />
                                    {/* <Route path="/team" element={<TeamManagement />} /> */}
                                </Routes>
                            </div>
                        </main>

                        <MinimalistDock />

                    </div>
                </Router>
            </NotificationProvider>
        </ThemeProvider>
    )
}

function DashboardHome() {
    return (
        <>
            <LandingHero />
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
                <EfficiencyBadge />
            </div>
            <Dashboard />
            <div style={{ marginTop: '2rem' }}>
                <LoanList />
            </div>
        </>
    )
}

function LoansPage() {
    const [refreshKey, setRefreshKey] = React.useState(0);

    const handleSuccess = () => {
        setRefreshKey(old => old + 1);
    };

    return (
        <>
            <NewLoanForm onSuccess={handleSuccess} />
            <div key={refreshKey}>
                <LoanList />
            </div>
        </>
    )
}

export default App
