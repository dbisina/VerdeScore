import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, Bell, Shield, Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const { addNotification } = useNotification();

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        addNotification(`Theme changed to ${newTheme}`, 'success');
    };

    return (
        <div className="max-w-3xl mx-auto pt-8 pb-24">
            <h2 className="text-3xl font-bold text-white mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                System Preferences
            </h2>

            {/* Theme Engine */}
            <Section title="Dynamic Theme Engine" icon={<Palette className="text-purple-400" />}>
                <div className="grid grid-cols-3 gap-4 mt-6">
                    <ThemeCard
                        label="Liquid"
                        active={theme === 'liquid'}
                        onClick={() => handleThemeChange('liquid')}
                        gradient="bg-gradient-to-br from-[#0f172a] to-[#0ea5e9]"
                    />
                    <ThemeCard
                        label="Midnight"
                        active={theme === 'dark'}
                        onClick={() => handleThemeChange('dark')}
                        gradient="bg-[#0a0a0a]"
                    />
                    <ThemeCard
                        label="System"
                        active={theme === 'system'}
                        onClick={() => handleThemeChange('system')}
                        gradient="bg-gray-800"
                    />
                </div>
            </Section>

            {/* Notification Settings */}
            <Section title="Notifications" icon={<Bell className="text-blue-400" />}>
                <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="font-medium text-white">Push Notifications</div>
                            <div className="text-sm text-gray-500">Receive alerts for loan updates</div>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                            ACTIVE
                        </div>
                    </div>
                </div>
            </Section>

            <Section title="Security Level" icon={<Shield className="text-green-400" />}>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 mt-4">
                    <div>
                        <div className="font-medium text-white">Session Security</div>
                        <div className="text-sm text-gray-500">Auto-logout after inactivity</div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                        ACTIVE
                    </div>
                </div>
            </Section>
        </div>
    );
}

function Section({ title, icon, children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl"
        >
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                    {icon}
                </div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>
            {children}
        </motion.div>
    )
}

function ThemeCard({ label, active, onClick, gradient }) {
    return (
        <div
            onClick={onClick}
            className={`
                relative h-32 rounded-2xl cursor-pointer overflow-hidden border transition-all duration-300
                ${active
                    ? 'border-secondary shadow-[0_0_20px_rgba(76,175,80,0.3)] scale-[1.02]'
                    : 'border-white/10 hover:border-white/30'
                }
            `}
        >
            <div className={`absolute inset-0 ${gradient} opacity-80`} />
            <div className="absolute inset-0 flex items-center justify-center font-medium text-white z-10">
                {label}
            </div>
            {active && (
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-secondary shadow-[0_0_5px_currentColor]" />
            )}
        </div>
    )
}
