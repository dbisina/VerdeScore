import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { fetchImpactHistory } from '../../../api';

export default function CarbonOffsetStreamgraph() {
    const [chartData, setChartData] = useState({
        labels: [],
        solar: [],
        wind: [],
        hydro: []
    });

    useEffect(() => {
        const loadData = async () => {
            const res = await fetchImpactHistory();
            setChartData(res.data || { labels: [], solar: [], wind: [], hydro: [] });
        };
        loadData();
    }, []);

    const data = {
        labels: chartData.labels,
        datasets: [
            {
                label: 'Solar',
                data: chartData.solar,
                fill: true,
                backgroundColor: 'rgba(16, 185, 129, 0.6)', // Green
                borderColor: 'transparent',
                tension: 0.5,
                pointRadius: 0,
            },
            {
                label: 'Wind',
                data: chartData.wind,
                fill: true,
                backgroundColor: 'rgba(6, 182, 212, 0.6)', // Cyan
                borderColor: 'transparent',
                tension: 0.5,
                pointRadius: 0,
            },
            {
                label: 'Hydro',
                data: chartData.hydro,
                fill: true,
                backgroundColor: 'rgba(59, 130, 246, 0.6)', // Blue
                borderColor: 'transparent',
                tension: 0.5,
                pointRadius: 0,
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: { color: '#cbd5e1', usePointStyle: true }
            }
        },
        scales: {
            x: { display: false },
            y: { display: false }
        },
        elements: {
            line: { borderWidth: 0 }
        }
    };

    return (
        <div className="h-full p-6 bg-[#0f172a]/60 backdrop-blur-xl rounded-3xl border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/5 pulse-slow" />
            <h3 className="text-white font-semibold mb-4 relative z-10">Offset Streams</h3>
            <div className="h-64 relative z-10">
                <Line data={data} options={options} />
            </div>
        </div>
    );
}
