'use client';

import { useEffect, useState } from 'react';
import { eachDayOfInterval, format, subMonths, endOfMonth, startOfMonth, isSameMonth, getDay, addMonths } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HistoryPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        fetch('/api/history').then(res => res.json()).then(setHistory);
    }, []);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Padding for start of month
    const startParam = getDay(monthStart);
    const emptyDays = Array(startParam).fill(null);

    const getScore = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const entry = history.find(h => h.date.startsWith(dateStr));
        return entry ? entry.totalScore : null;
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">History</h1>
                <p className="text-gray-500">Your performance at a glance.</p>
            </div>

            <div className="glass-panel p-6 max-w-xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"><ChevronLeft /></button>
                    <h2 className="text-xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"><ChevronRight /></button>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                        <div key={d} className="text-center text-xs text-gray-400 font-bold">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}
                    {daysInMonth.map((date) => {
                        const score = getScore(date);
                        return (
                            <div key={date.toString()} className="aspect-square flex flex-col items-center justify-center relative group">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all cursor-default",
                                        score === null ? "bg-gray-100 dark:bg-white/5 text-gray-400" :
                                            score > 0 ? "bg-green-500 text-white shadow-lg shadow-green-500/20" :
                                                score < 0 ? "bg-red-500 text-white shadow-lg shadow-red-500/20" :
                                                    "bg-gray-300 dark:bg-gray-700 text-white"
                                    )}
                                >
                                    {format(date, 'd')}
                                </motion.div>
                                {score !== null && (
                                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">
                                        Score: {score}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
