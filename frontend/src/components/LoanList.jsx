import React, { useEffect, useState } from 'react';
import { fetchLoans } from '../api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function LoanList() {
    const [loans, setLoans] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadLoans();
    }, []);

    const loadLoans = async () => {
        const result = await fetchLoans();
        setLoans(result.data || []);
    };

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Active Applications</h2>
            </div>

            <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/5 backdrop-blur-sm">
                <table className="w-full text-left">
                    <thead className="bg-black/20 text-gray-400 font-medium">
                        <tr>
                            <th className="p-4">Applicant</th>
                            <th className="p-4">Purpose</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Green Score</th>
                            <th className="p-4">Risk Score</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loans.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">
                                    No active loan applications found.
                                </td>
                            </tr>
                        ) : (
                            loans.map((loan, index) => (
                                <motion.tr
                                    key={loan.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => navigate(`/loan/${loan.id}`)}
                                    className="hover:bg-white/5 transition-colors group text-sm cursor-pointer"
                                >
                                    <td className="p-4 font-medium text-white">{loan.applicant_name}</td>
                                    <td className="p-4 text-gray-400">{loan.purpose}</td>
                                    <td className="p-4 text-white">${loan.amount.toLocaleString()}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-2 bg-gray-700/50 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-secondary shadow-[0_0_10px_rgba(76,175,80,0.5)]"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${loan.green_score}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                />
                                            </div>
                                            <span className="text-secondary font-bold">{loan.green_score}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={loan.risk_score > 50 ? 'text-red-400 font-medium' : 'text-amber-400 font-medium'}>
                                            {loan.risk_score}%
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${loan.status === 'APPROVED' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                                            {loan.status}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
