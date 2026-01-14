import React, { useState, useEffect } from 'react';

export default function MovingDotCard({ target = 0, label = "Generic", prefix = "", duration = 2000 }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = parseInt(target, 10) || 0;
        const range = end - start;
        if (range <= 0) {
            setCount(end);
            return;
        }

        const stepTime = 50;
        const steps = duration / stepTime;
        const increment = Math.ceil(range / steps);

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                start = end;
                clearInterval(timer);
            }
            setCount(start);
        }, stepTime);

        return () => clearInterval(timer);
    }, [target, duration]);

    const display = count.toLocaleString();

    return (
        <div className="dot-card-outer relative w-full h-32 rounded-xl p-[1px] overflow-hidden group bg-white/5">
            {/* Moving Dot Border Animation - Optimized with Transform */}
            <div className="absolute inset-0 z-0">
                <div className="absolute w-[300%] h-[300%] top-[-100%] left-[-100%] animate-[spin_12s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_340deg,cyan_360deg)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Card Content */}
            <div className="dot-card-inner relative w-full h-full bg-[#1e293b]/90 backdrop-blur-xl rounded-xl border border-white/5 p-6 flex flex-col justify-center overflow-hidden z-10">
                {/* Ray/Sheen Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                <div className="relative z-20">
                    <div className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wider">{label}</div>
                    <div className="text-3xl font-bold text-white tabular-nums tracking-tight text-shadow-sm">
                        <span className="text-gray-500 mr-1">{prefix}</span>
                        {display}
                    </div>
                </div>
            </div>
        </div>
    );
}
