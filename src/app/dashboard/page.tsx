'use client';

import { useEffect, useState } from 'react';
import { format, subDays, addDays, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Check, X, Minus, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Habit, DayLog, Streak } from '@/lib/types'; // Updated types import
import StreakCard from '@/components/StreakCard';

export default function Dashboard() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [habits, setHabits] = useState<Habit[]>([]);
    const [streaks, setStreaks] = useState<Streak[]>([]);
    const [dayLog, setDayLog] = useState<DayLog | null>(null);
    const [streakLogs, setStreakLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Load habits and day log
    const fetchData = async () => {
        setLoading(true);
        const dateStr = format(selectedDate, 'yyyy-MM-dd');

        // Parallel Fetching
        const [hRes, sRes, dRes, slRes] = await Promise.all([
            fetch('/api/habits'),
            fetch('/api/streaks'),
            fetch(`/api/days?date=${dateStr}`),
            fetch(`/api/streaks/log?date=${dateStr}`)
        ]);

        const allHabits = await hRes.json();
        setHabits(allHabits.filter((h: any) => h.isActive));

        const allStreaks = await sRes.json();
        setStreaks(allStreaks.filter((s: any) => s.isActive));

        setDayLog(await dRes.json());
        setStreakLogs(await slRes.json());

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const handleStatusChange = async (habitId: string, status: string) => {
        // Optimistic Update
        const currentEntries = dayLog?.entries || [];
        const existingIndex = currentEntries.findIndex((e: any) => e.habitId === habitId);

        let newEntries = [...currentEntries];
        if (existingIndex >= 0) {
            newEntries[existingIndex] = { ...newEntries[existingIndex], status };
        } else {
            newEntries.push({ habitId, status });
        }

        // Recalculate Score locally for UI snap
        let newScore = 0;
        for (const entry of newEntries) {
            const h = habits.find(h => h.id === entry.habitId);
            if (h) {
                if (entry.status === 'COMPLETED') {
                    // Points are already negative for BAD habits in the DB, or positive for GOOD
                    newScore += h.points;
                }
                else if (entry.status === 'MISSED') {
                    // Missed points logic
                    newScore += h.missedPoints;
                }
            }
        }

        setDayLog(prev => ({
            ...prev!,
            id: prev?.id || 'temp',
            date: format(selectedDate, 'yyyy-MM-dd'),
            totalScore: newScore,
            entries: newEntries
        }));

        // API Call
        await fetch('/api/days', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                date: format(selectedDate, 'yyyy-MM-dd'),
                entries: newEntries
            })
        });
    };

    const handleStreakUpdate = async (streakId: string, status: string) => {
        const updatedLogs = [...streakLogs];
        const index = updatedLogs.findIndex(l => l.streakId === streakId);
        if (index >= 0) {
            updatedLogs[index] = { ...updatedLogs[index], status };
        } else {
            updatedLogs.push({ streakId, status });
        }
        setStreakLogs(updatedLogs);

        const res = await fetch('/api/streaks/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                streakId,
                date: format(selectedDate, 'yyyy-MM-dd'),
                status
            })
        });
        const data = await res.json();
        if (data.streak) {
            setStreaks(prev => prev.map(s => s.id === data.streak.id ? data.streak : s));
        }
    };

    const getHabitStatus = (habitId: string) => {
        return dayLog?.entries.find((e: any) => e.habitId === habitId)?.status || 'UNTRACKED';
    };

    const getStreakStatus = (streakId: string) => {
        return streakLogs.find(l => l.streakId === streakId)?.status || 'UNTRACKED';
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Date Navigation */}
            <div className="flex items-center justify-between glass-panel p-4">
                <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                    <ChevronLeft />
                </button>
                <div className="text-center">
                    <h2 className="text-2xl font-bold">{isSameDay(selectedDate, new Date()) ? 'Today' : format(selectedDate, 'EEEE')}</h2>
                    <p className="text-gray-500">{format(selectedDate, 'MMMM d, yyyy')}</p>
                </div>
                <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                    <ChevronRight />
                </button>
            </div>

            {/* Score Card */}
            <motion.div
                key={dayLog?.totalScore}
                initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                className={cn(
                    "text-center p-8 rounded-3xl transition-colors duration-500",
                    (dayLog?.totalScore || 0) > 0 ? "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400" :
                        (dayLog?.totalScore || 0) < 0 ? "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400" :
                            "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400"
                )}
            >
                <span className="text-6xl font-black tracking-tighter">
                    {(dayLog?.totalScore || 0) > 0 ? '+' : ''}{dayLog?.totalScore || 0}
                </span>
                <p className="text-sm font-medium opacity-80 mt-2 uppercase tracking-wide">Daily Score</p>
            </motion.div>

            {/* Streaks Section */}
            {streaks.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-orange-500">
                        <Flame size={20} className="fill-orange-500" />
                        Active Streaks
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        {streaks.map(streak => (
                            <StreakCard
                                key={streak.id}
                                streak={streak}
                                status={getStreakStatus(streak.id)}
                                onUpdateStatus={handleStreakUpdate}
                                compact={true}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Habits List */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-500">Habits</h3>
                {loading ? (
                    <p className="text-center text-gray-500 py-12">Loading habits...</p>
                ) : (
                    habits.map((habit, i) => {
                        const status = getHabitStatus(habit.id);
                        return (
                            <motion.div
                                key={habit.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={cn(
                                    "glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300",
                                    status === 'COMPLETED' ? "border-green-500/30 bg-green-50/50 dark:bg-green-900/10" :
                                        status === 'MISSED' ? "border-red-500/30 bg-red-50/50 dark:bg-red-900/10" :
                                            status === 'SKIPPED' ? "opacity-60" : ""
                                )}
                            >
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-lg font-bold">{habit.name}</h3>
                                    <div className="text-xs font-medium text-gray-400 flex gap-2 justify-center md:justify-start mt-1">
                                        <span>Done: {habit.points > 0 ? '+' : ''}{habit.points}</span>
                                        <span>•</span>
                                        <span>Miss: {habit.missedPoints > 0 ? '+' : ''}{habit.missedPoints}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleStatusChange(habit.id, 'COMPLETED')}
                                        className={cn(
                                            "p-4 rounded-xl transition-all",
                                            status === 'COMPLETED'
                                                ? "bg-green-500 text-white shadow-lg shadow-green-500/30 scale-105"
                                                : "bg-gray-100 dark:bg-white/5 text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/20 hover:text-green-600"
                                        )}
                                    >
                                        <Check size={24} />
                                    </button>

                                    <button
                                        onClick={() => handleStatusChange(habit.id, 'MISSED')}
                                        className={cn(
                                            "p-4 rounded-xl transition-all",
                                            status === 'MISSED'
                                                ? "bg-red-500 text-white shadow-lg shadow-red-500/30 scale-105"
                                                : "bg-gray-100 dark:bg-white/5 text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600"
                                        )}
                                    >
                                        <X size={24} />
                                    </button>

                                    <button
                                        onClick={() => handleStatusChange(habit.id, 'SKIPPED')}
                                        className={cn(
                                            "p-4 rounded-xl transition-all",
                                            status === 'SKIPPED'
                                                ? "bg-gray-500 text-white shadow-lg shadow-gray-500/30 scale-105"
                                                : "bg-gray-100 dark:bg-white/5 text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-600"
                                        )}
                                    >
                                        <Minus size={24} />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
