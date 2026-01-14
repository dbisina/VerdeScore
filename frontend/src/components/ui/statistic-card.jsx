import React from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle, CardToolbar } from './card';
import { BanknoteArrowUp } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const balanceData = {
    balance: 10976.95,
    delta: 5.7,
    currencies: [
        { code: 'USD', percent: 30, color: 'bg-white' },
        { code: 'GBP', percent: 20, color: 'bg-indigo-400' },
        { code: 'EUR', percent: 15, color: 'bg-blue-500' },
        { code: 'JPY', percent: 20, color: 'bg-violet-600' },
        { code: 'CNY', percent: 15, color: 'bg-fuchsia-600' },
    ],
};

export default function StatisticCard() {
    return (
        <div className="w-full flex items-center justify-center p-0">
            <Card className="w-full rounded-2xl shadow-xl border-0 bg-[#0f172a]/60 text-white backdrop-blur-xl">
                <CardHeader className="border-0 pb-2 pt-6">
                    <CardTitle className="text-lg font-semibold text-gray-400">Portfolio Distribution</CardTitle>
                    <CardToolbar>
                        <Button className="bg-white/10 text-white border-white/5 hover:bg-white/20">
                            <BanknoteArrowUp size={16} />
                            Rebalance
                        </Button>
                    </CardToolbar>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-2 mb-5">
                        <span className="text-3xl font-bold tracking-tight text-white">
                            ${balanceData.balance.toLocaleString()}
                        </span>
                        <span className="text-base font-semibold text-green-400 ms-2">+{balanceData.delta}%</span>
                    </div>

                    <div className="border-b border-white/10 mb-6" />

                    {/* Segmented Progress Bar */}
                    <div className="flex items-center gap-1.5 w-full mb-3">
                        {balanceData.currencies.map((cur) => (
                            <div
                                key={cur.code}
                                className="space-y-2.5"
                                style={{
                                    width: `${cur.percent}%`,
                                }}
                            >
                                <div className={cn(cur.color, 'h-2.5 w-full overflow-hidden  rounded-sm transition-all shadow-[0_0_10px_rgba(255,255,255,0.2)]')} />

                                <div key={cur.code} className="flex flex-col items-start flex-1">
                                    <span className="text-xs text-gray-500 font-medium">{cur.code}</span>
                                    <span className="text-base font-semibold text-white">{cur.percent}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
