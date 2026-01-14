import React, { useState } from 'react';
import { Home, FileText, Leaf, BarChart3, Settings, Search, User, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const dockItems = [
    { id: 'dashboard', icon: <Home size={20} />, label: 'Dashboard', path: '/' },
    { id: 'loans', icon: <FileText size={20} />, label: 'Loans', path: '/loans' },
    { id: 'impact', icon: <Leaf size={20} />, label: 'Impact', path: '/impact' },
    { id: 'reports', icon: <BarChart3 size={20} />, label: 'Reports', path: '/reports' },
    { id: 'search', icon: <Search size={20} />, label: 'Search', path: '/search' },
    { id: 'profile', icon: <User size={20} />, label: 'Profile', path: '/profile' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
];

const DockItemComponent = ({ item, isHovered, onHover, isActive }) => {
    return (
        <Link to={item.path} className="relative group focus:outline-none">
            <div
                className="relative"
                onMouseEnter={() => onHover(item.id)}
                onMouseLeave={() => onHover(null)}
            >
                <motion.div
                    className={`
            relative flex items-center justify-center
            w-12 h-12 rounded-2xl
            backdrop-blur-md
            border
            transition-all duration-300 ease-out
            cursor-pointer
            ${isActive
                            ? 'bg-white/20 border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                            : 'bg-white/5 border-white/10'
                        }
          `}
                    animate={{
                        scale: isHovered ? 1.2 : 1,
                        y: isHovered ? -10 : 0,
                        backgroundColor: isHovered ? 'rgba(255,255,255,0.15)' : (isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'),
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                    <div className={`text-white transition-all duration-300 ${isActive ? 'text-secondary' : 'text-gray-300'}`}>
                        {item.icon}
                    </div>
                </motion.div>

                {/* Tooltip */}
                <div className={`
          absolute -top-12 left-1/2 transform -translate-x-1/2
          px-3 py-1.5 rounded-lg
          bg-[#0f172a]/90 backdrop-blur-md
          text-white text-xs font-medium
          border border-white/10
          transition-all duration-200
          pointer-events-none
          whitespace-nowrap
          shadow-xl
          ${isHovered
                        ? 'opacity-100 translate-y-0 scale-100'
                        : 'opacity-0 translate-y-2 scale-95'
                    }
        `}>
                    {item.label}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="w-2 h-2 bg-[#0f172a]/90 rotate-45 border-r border-b border-white/10"></div>
                    </div>
                </div>

                {/* Active Indicator Dot */}
                {isActive && (
                    <motion.div
                        layoutId="activeDot"
                        className="absolute -bottom-2 left-1/2 w-1 h-1 bg-secondary rounded-full transform -translate-x-1/2"
                    />
                )}
            </div>
        </Link>
    );
};

export default function MinimalistDock() {
    const [hoveredItem, setHoveredItem] = useState(null);
    const location = useLocation();

    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <div className="relative">
                {/* Dock Container */}
                <div className="
          flex items-end gap-3 px-6 py-4
          rounded-3xl
          bg-[#0f172a]/60 backdrop-blur-xl
          border border-white/10
          shadow-2xl ring-1 ring-white/5
        ">
                    {dockItems.map((item) => (
                        <DockItemComponent
                            key={item.id}
                            item={item}
                            isHovered={hoveredItem === item.id}
                            onHover={setHoveredItem}
                            isActive={location.pathname === item.path}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
