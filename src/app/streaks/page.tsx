'use client';

import { useEffect, useState } from 'react';
import StreakCard from '@/components/StreakCard';
import StreakForm from '@/components/StreakForm';
import { Plus, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import type { StreakStatus } from '@/lib/types';

export default function StreaksPage() {
    const [streaks, setStreaks] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingStreak, setEditingStreak] = useState<any>(null);

    const fetchData = async () => {
        // Fetch streaks
        const sRes = await fetch('/api/streaks');
        const sData = await sRes.json();
        setStreaks(sData);

        // Fetch today's logs to show status
        const dateStr = format(new Date(), 'yyyy-MM-dd');
        const lRes = await fetch(`/api/streaks/log?date=${dateStr}`);
        const lData = await lRes.json();
        setLogs(lData);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateStatus = async (streakId: string, status: StreakStatus) => {
        const updatedLogs = [...logs];
        const index = updatedLogs.findIndex(l => l.streakId === streakId);
        if (index >= 0) {
            updatedLogs[index] = { ...updatedLogs[index], status };
        } else {
            updatedLogs.push({ streakId, status });
        }
        setLogs(updatedLogs); // Optimistic UI

        // API
        const res = await fetch('/api/streaks/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                streakId,
                date: format(new Date(), 'yyyy-MM-dd'),
                status
            })
        });

        const data = await res.json();
        // Update the streak metrics in local state from server response
        if (data.streak) {
            setStreaks(prev => prev.map(s => s.id === data.streak.id ? data.streak : s));
        }
    };

    const getStatus = (streakId: string) => {
        return logs.find(l => l.streakId === streakId)?.status || 'UNTRACKED';
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                        <Flame className="text-orange-500 fill-orange-500" />
                        Streaks
                    </h1>
                    <p className="text-gray-500">Protect your chains. Never break a streak.</p>
                </div>
                <button
                    onClick={() => { setEditingStreak(null); setIsFormOpen(true); }}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    New Streak
                </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {streaks.map((streak, i) => (
                    <motion.div
                        key={streak.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <StreakCard
                            streak={streak}
                            status={getStatus(streak.id)}
                            onUpdateStatus={handleUpdateStatus}
                        />
                    </motion.div>
                ))}

                {streaks.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-3xl">
                        <p>No streaks active.</p>
                    </div>
                )}
            </div>

            {isFormOpen && (
                <StreakForm
                    onClose={() => setIsFormOpen(false)}
                    onSave={() => { setIsFormOpen(false); fetchData(); }}
                    initialData={editingStreak}
                />
            )}
        </div>
    );
}
