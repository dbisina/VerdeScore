import React from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

/**
 * A screen time card component that displays usage statistics with an animated bar graph.
 * Adapted for Liquid Theme.
 */
export default function ScreenTimeCard({
    totalHours,
    totalMinutes,
    barData,
    timeLabels = ["5 AM", "11 AM", "5 PM"],
    topApps,
    className,
}) {
    // Normalize bar data to 0-1 range for height calculation
    const maxValue = Math.max(...barData);
    const normalizedData = barData.map((value) => value / maxValue);

    // Animation variants for bars
    const barVariants = {
        hidden: { scaleY: 0 },
        visible: (i) => ({
            scaleY: 1,
            transition: {
                delay: i * 0.02,
                type: "spring",
                stiffness: 100,
                damping: 12,
            },
        }),
    };

    return (
        <div
            className={cn(
                "w-full rounded-3xl border border-white/10 bg-[#0f172a]/60 backdrop-blur-xl text-white shadow-2xl px-6 py-6",
                className
            )}
        >
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left side - Main graph */}
                <div className="flex-1">
                    {/* Total time display */}
                    <div className="mb-4">
                        <div className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-1">Activity Volume</div>
                        <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            {totalHours}<span className="text-xl text-gray-500 font-normal ml-1">h</span> {totalMinutes}<span className="text-xl text-gray-500 font-normal ml-1">m</span>
                        </div>
                    </div>

                    {/* Bar graph */}
                    <div className="relative h-40">
                        {/* Guide lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                            <div className="h-px border-t border-dashed border-white/5" />
                            <div className="h-px border-t border-dashed border-white/5" />
                            <div className="h-px border-t border-dashed border-white/5" />
                        </div>

                        {/* Bars */}
                        <div className="absolute inset-0 flex items-end gap-[4px] z-10">
                            {normalizedData.map((height, index) => {
                                // Determine bar color - highlight certain bars
                                const isHighlighted = height > 0.6;
                                const barColor = isHighlighted
                                    ? "bg-gradient-to-t from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                                    : "bg-white/10 hover:bg-white/20";

                                return (
                                    <motion.div
                                        key={index}
                                        custom={index}
                                        variants={barVariants}
                                        initial="hidden"
                                        animate="visible"
                                        className={cn(
                                            "flex-1 rounded-t-sm origin-bottom transition-colors duration-300",
                                            barColor
                                        )}
                                        style={{ height: `${height * 100}%` }}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* X-axis labels */}
                    <div className="flex justify-between text-xs text-gray-500 mt-2 font-mono">
                        {timeLabels.map((label, index) => (
                            <span key={index}>{label}</span>
                        ))}
                    </div>
                </div>

                {/* Vertical divider (md+) */}
                <div className="hidden md:block w-px bg-white/10 self-stretch" />

                {/* Right side - Top apps */}
                <div className="flex flex-col gap-4 justify-center min-w-[200px]">
                    {topApps.map((app, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-gray-300">
                                {app.icon}
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-medium text-white">{app.name}</div>
                                <div className="text-xs text-gray-500">{app.duration}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};
