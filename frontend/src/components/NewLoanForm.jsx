import React, { useState } from 'react';
import { createLoan } from '../api';
import { Loader2, Leaf, Zap, Building2, MapPin, Calendar } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const PROJECT_TYPES = [
    { value: 'solar', label: 'Solar Energy', icon: '☀️' },
    { value: 'wind', label: 'Wind Energy', icon: '🌬️' },
    { value: 'hydro', label: 'Hydroelectric', icon: '💧' },
    { value: 'biomass', label: 'Biomass/Biogas', icon: '🌿' },
    { value: 'efficiency', label: 'Energy Efficiency', icon: '⚡' },
    { value: 'ev', label: 'EV Infrastructure', icon: '🔌' },
    { value: 'sustainable_building', label: 'Green Building', icon: '🏗️' },
    { value: 'waste', label: 'Waste Management', icon: '♻️' },
    { value: 'water', label: 'Water Conservation', icon: '🚰' },
    { value: 'agriculture', label: 'Sustainable Agriculture', icon: '🌾' },
];

const CAPACITY_UNITS = [
    { value: 'kw', label: 'kW' },
    { value: 'mw', label: 'MW' },
    { value: 'sqft', label: 'sq ft' },
    { value: 'units', label: 'units' },
    { value: 'tons', label: 'tons/year' },
];

export default function NewLoanForm({ onSuccess }) {
    const [formData, setFormData] = useState({
        applicant_name: '',
        company_type: '',
        location: '',
        amount: '',
        project_type: '',
        capacity: '',
        capacity_unit: 'kw',
        expected_co2_reduction: '',
        project_timeline: '',
        purpose: ''
    });
    const [loading, setLoading] = useState(false);
    const { addNotification } = useNotification();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Construct detailed purpose from form fields
            const selectedType = PROJECT_TYPES.find(t => t.value === formData.project_type);
            const detailedPurpose = `${selectedType?.label || 'Green'} project: ${formData.purpose}. ` +
                `Capacity: ${formData.capacity} ${formData.capacity_unit}. ` +
                `Expected CO2 reduction: ${formData.expected_co2_reduction} tonnes/year. ` +
                `Timeline: ${formData.project_timeline} months. ` +
                `Location: ${formData.location}.`;

            await createLoan({
                applicant_name: `${formData.applicant_name}${formData.company_type ? ` (${formData.company_type})` : ''}`,
                amount: Number(formData.amount),
                purpose: detailedPurpose
            });

            setFormData({
                applicant_name: '',
                company_type: '',
                location: '',
                amount: '',
                project_type: '',
                capacity: '',
                capacity_unit: 'kw',
                expected_co2_reduction: '',
                project_timeline: '',
                purpose: ''
            });
            addNotification('Green loan application submitted for AI evaluation!', 'success');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            addNotification('Failed to submit application. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md mb-8">
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <span className="w-1 h-6 bg-secondary rounded-full"></span>
                New Green Loan Application
            </h3>
            <p className="text-sm text-gray-500 mb-6">AI-powered sustainability scoring for renewable energy projects</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Row 1: Applicant Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2 flex items-center gap-1">
                            <Building2 size={14} /> Organization Name
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.applicant_name}
                            onChange={e => updateField('applicant_name', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-secondary transition-colors"
                            placeholder="e.g. GreenTech Solutions"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Organization Type</label>
                        <select
                            value={formData.company_type}
                            onChange={e => updateField('company_type', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-secondary transition-colors"
                        >
                            <option value="">Select type...</option>
                            <option value="Corporation">Corporation</option>
                            <option value="LLC">LLC</option>
                            <option value="Non-Profit">Non-Profit</option>
                            <option value="Municipal">Municipal/Government</option>
                            <option value="Cooperative">Cooperative</option>
                            <option value="Startup">Startup</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2 flex items-center gap-1">
                            <MapPin size={14} /> Project Location
                        </label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={e => updateField('location', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-secondary transition-colors"
                            placeholder="e.g. Austin, TX"
                        />
                    </div>
                </div>

                {/* Row 2: Project Type and Amount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2 flex items-center gap-1">
                            <Leaf size={14} /> Project Type
                        </label>
                        <select
                            required
                            value={formData.project_type}
                            onChange={e => updateField('project_type', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-secondary transition-colors"
                        >
                            <option value="">Select project type...</option>
                            {PROJECT_TYPES.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.icon} {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Loan Amount ($)</label>
                        <input
                            type="number"
                            required
                            min="1000"
                            value={formData.amount}
                            onChange={e => updateField('amount', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-secondary transition-colors"
                            placeholder="500000"
                        />
                    </div>
                </div>

                {/* Row 3: Capacity and Environmental Impact */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm text-gray-400 mb-2 flex items-center gap-1">
                            <Zap size={14} /> Project Capacity
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={formData.capacity}
                                onChange={e => updateField('capacity', e.target.value)}
                                className="flex-1 px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-secondary transition-colors"
                                placeholder="e.g. 50"
                            />
                            <select
                                value={formData.capacity_unit}
                                onChange={e => updateField('capacity_unit', e.target.value)}
                                className="w-24 px-3 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-secondary transition-colors"
                            >
                                {CAPACITY_UNITS.map(unit => (
                                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Est. CO2 Reduction</label>
                        <input
                            type="number"
                            value={formData.expected_co2_reduction}
                            onChange={e => updateField('expected_co2_reduction', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-secondary transition-colors"
                            placeholder="tonnes/year"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2 flex items-center gap-1">
                            <Calendar size={14} /> Timeline
                        </label>
                        <input
                            type="number"
                            value={formData.project_timeline}
                            onChange={e => updateField('project_timeline', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-secondary transition-colors"
                            placeholder="months"
                        />
                    </div>
                </div>

                {/* Row 4: Purpose Description */}
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Project Description</label>
                    <textarea
                        required
                        value={formData.purpose}
                        onChange={e => updateField('purpose', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-secondary transition-colors resize-none"
                        placeholder="Describe the environmental impact and sustainability goals of this project..."
                    />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 flex items-center gap-2 bg-secondary hover:bg-green-500 text-black font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(76,175,80,0.3)] hover:shadow-[0_0_25px_rgba(76,175,80,0.5)] active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Leaf size={20} />}
                        {loading ? 'Evaluating...' : 'Submit for AI Evaluation'}
                    </button>
                </div>
            </form>
        </div>
    );
}
