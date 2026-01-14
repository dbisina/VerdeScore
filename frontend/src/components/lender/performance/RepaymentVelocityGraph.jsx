import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler } from 'chart.js';
import { fetchPerformance } from '../../../api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

export default function RepaymentVelocityGraph() {
    const [velocityData, setVelocityData] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            const res = await fetchPerformance();
            setVelocityData(res.data?.velocityData || []);
        };
        loadData();
    }, []);

    const data = {
        labels: velocityData.map(d => d.month),
        datasets: [
            {
                label: 'Repayment Velocity',
                data: velocityData.map(d => d.value),
                fill: true,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.5)');
                    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
                    return gradient;
                },
                borderColor: '#10b981',
                tension: 0.4,
                borderWidth: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#10b981',
                pointHoverBackgroundColor: '#10b981',
                pointHoverBorderColor: '#fff',
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#fff',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#94a3b8' }
            },
            y: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { display: false }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };

    return (
        <div className="h-full w-full p-4 bg-[#0f172a]/60 backdrop-blur-xl rounded-3xl border border-white/10 relative overflow-hidden group">
            <h3 className="text-white font-semibold mb-1">Repayment Velocity</h3>
            <p className="text-xs text-gray-500 mb-4">Momentum analysis over 6m</p>
            <div className="h-48">
                <Line data={data} options={options} />
            </div>
        </div>
    );
}
