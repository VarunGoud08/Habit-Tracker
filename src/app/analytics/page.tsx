'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/history').then(res => res.json()).then(raw => {
            // Process data to be chart-friendly
            // We want to fill in gaps with 0 maybe? Or just scatter plot.
            // Requirements: "Line graph with Neutral horizontal line at 0"

            if (!raw || raw.length === 0) return;

            const formatted = raw.map((r: any) => ({
                ...r,
                displayDate: format(parseISO(r.date), 'MMM d'), // e.g. Jan 1
                score: r.totalScore
            }));
            setData(formatted);
        });
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Analytics</h1>
                <p className="text-gray-500">Visualizing your progress over time.</p>
            </div>

            <div className="glass-panel p-6 h-[400px] w-full">
                <h2 className="text-lg font-bold mb-6">Net Score Trend</h2>

                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="85%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                            <XAxis
                                dataKey="displayDate"
                                stroke="#888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                cursor={{ stroke: '#ddd' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="score"
                                stroke="url(#gradient)"
                                strokeWidth={3}
                                dot={{ r: 4, fill: 'white', strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#22c55e" /> {/* Green */}
                                    <stop offset="100%" stopColor="#3b82f6" /> {/* Blue */}
                                </linearGradient>
                            </defs>
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                        Not enough data to display chart. Start tracking today!
                    </div>
                )}
            </div>

            {/* Summary Stats (Mockup for now, could be computed) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-panel p-4 text-center">
                    <div className="text-2xl font-bold">{data.length}</div>
                    <div className="text-xs text-gray-500 uppercase mt-1">Days Tracked</div>
                </div>
                <div className="glass-panel p-4 text-center">
                    <div className="text-2xl font-bold text-green-500">
                        {data.filter(d => d.score > 0).length}
                    </div>
                    <div className="text-xs text-gray-500 uppercase mt-1">Positive Days</div>
                </div>
                <div className="glass-panel p-4 text-center">
                    <div className="text-2xl font-bold text-red-500">
                        {data.filter(d => d.score < 0).length}
                    </div>
                    <div className="text-xs text-gray-500 uppercase mt-1">Negative Days</div>
                </div>
                <div className="glass-panel p-4 text-center">
                    <div className="text-2xl font-bold">
                        {data.reduce((acc, curr) => acc + curr.score, 0)}
                    </div>
                    <div className="text-xs text-gray-500 uppercase mt-1">Lifetime Score</div>
                </div>
            </div>
        </div>
    );
}
