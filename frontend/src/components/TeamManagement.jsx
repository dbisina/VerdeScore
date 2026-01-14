import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, UserPlus, Trash2, Mail, Phone, BadgeCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchTeam, inviteTeamMember, deleteTeamMember } from '../api';

export default function TeamManagement() {
    const { hasPermission } = useAuth();
    const [team, setTeam] = useState([]);
    const [showInvite, setShowInvite] = useState(false);
    const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'Loan Officer', access: 'Viewer' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTeam();
    }, []);

    const loadTeam = async () => {
        try {
            const res = await fetchTeam();
            if (res.data) setTeam(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async () => {
        if (!inviteForm.name || !inviteForm.email) return;
        await inviteTeamMember(inviteForm);
        setShowInvite(false);
        setInviteForm({ name: '', email: '', role: 'Loan Officer', access: 'Viewer' });
        loadTeam();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Remove this team member?')) {
            await deleteTeamMember(id);
            loadTeam();
        }
    };

    return (
        <div className="max-w-6xl mx-auto pt-8 pb-24 px-6">

            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Team Management</h2>
                    <p className="text-gray-400">Manage access and roles for your sustainability department.</p>
                </div>
                {hasPermission('manage_team') && (
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-xl transition-all"
                        onClick={() => setShowInvite(!showInvite)}
                    >
                        <UserPlus size={18} />
                        Add Member
                    </button>
                )}
            </div>

            {/* Invite Panel */}
            {showInvite && hasPermission('manage_team') && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
                >
                    <h3 className="text-white font-semibold mb-4">Invite New Team Member</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500/50"
                            value={inviteForm.name}
                            onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                        />
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500/50"
                            value={inviteForm.email}
                            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                        />
                        <select
                            className="bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-gray-300 focus:outline-none focus:border-green-500/50"
                            value={inviteForm.role}
                            onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                        >
                            <option>Loan Officer</option>
                            <option>Senior Analyst</option>
                            <option>Risk Analyst</option>
                            <option>Compliance Manager</option>
                            <option>Admin</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            className="px-4 py-2 text-gray-400 hover:text-white"
                            onClick={() => setShowInvite(false)}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleInvite}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg"
                        >
                            Send Invitation
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Team Grid */}
            <div className="grid grid-cols-1 gap-4">
                {team.map((member, index) => (
                    <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row items-center gap-6"
                    >
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                {member.avatar || member.name.charAt(0)}
                            </div>
                            <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-[#0f172a] rounded-full ${member.status === 'Active' ? 'bg-green-500' : 'bg-amber-500'
                                }`} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                                {member.access === 'Admin' && <BadgeCheck size={16} className="text-blue-400" />}
                            </div>
                            <div className="text-sm text-gray-400">{member.role}</div>
                        </div>

                        {/* Contact */}
                        <div className="flex flex-col gap-1 text-sm text-gray-500 min-w-[200px]">
                            <div className="flex items-center gap-2">
                                <Mail size={14} /> {member.email}
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield size={14} /> Access: <span className="text-gray-300">{member.access || 'Viewer'}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            {hasPermission('manage_team') && (
                                <button
                                    onClick={() => handleDelete(member.id)}
                                    className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                                    title="Remove Member"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
                {team.length === 0 && !loading && (
                    <div className="text-center p-8 text-gray-500">No team members found. Invite someone!</div>
                )}
            </div>
        </div>
    );
}
