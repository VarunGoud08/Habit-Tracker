'use client';

import { motion } from 'framer-motion';
import { Flame, X, Check, Minus, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Streak, StreakStatus } from '@/lib/types';
import confetti from 'canvas-confetti';

interface StreakCardProps {
    streak: Streak;
    status: StreakStatus;
    onUpdateStatus: (id: string, status: StreakStatus) => void;
    compact?: boolean; // For dashboard view
}

export default function StreakCard({ streak, status, onUpdateStatus, compact = false }: StreakCardProps) {

    const handleFollowed = () => {
        if (status !== 'FOLLOWED') {
            // Trigger confetti if this is a nice increment?
            // For now just simple confetti
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 },
                colors: ['#22c55e', '#ffffff']
            });
        }
        onUpdateStatus(streak.id, 'FOLLOWED');
    };

    return (
        <motion.div
            layout
            className={cn(
                "glass-panel relative overflow-hidden transition-all duration-300",
                compact ? "p-4" : "p-6",
                status === 'BROKEN' ? "border-red-500/20 bg-red-500/5" :
                    status === 'FOLLOWED' ? "border-green-500/20 bg-green-500/5" :
                        ""
            )}
        >
            {/* Background Flame Effect */}
            {streak.currentStreak > 0 && status !== 'BROKEN' && (
                <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
                    <Flame size={compact ? 100 : 180} />
                </div>
            )}

            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                            streak.type === 'AVOID' ? "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
                                : "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                        )}>
                            {streak.type}
                        </span>
                        {status === 'FOLLOWED' && <Check size={14} className="text-green-500" />}
                    </div>
                    <h3 className={cn("font-bold", compact ? "text-lg" : "text-xl")}>{streak.name}</h3>
                    {!compact && <p className="text-sm text-gray-500">{streak.description}</p>}
                </div>

                <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-2xl font-black">
                        <Flame size={24} className={cn(
                            streak.currentStreak > 0 && status !== 'BROKEN' ? "fill-orange-500 text-orange-500 animate-pulse" : "text-gray-300"
                        )} />
                        <span>{streak.currentStreak}</span>
                    </div>
                    <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Current Streak</div>
                </div>
            </div>

            {!compact && (
                <div className="flex items-center gap-2 mb-6 text-xs text-gray-400 bg-gray-50 dark:bg-white/5 p-2 rounded-lg w-fit">
                    <Trophy size={14} className="text-yellow-500" />
                    <span>Best: {Math.max(streak.highestStreak, streak.currentStreak)} days</span>
                </div>
            )}

            {/* Controls */}
            <div className="flex gap-2">
                <button
                    onClick={handleFollowed}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all active:scale-95",
                        status === 'FOLLOWED'
                            ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                            : "bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-green-500 hover:text-green-500"
                    )}
                >
                    <Check size={18} />
                    {compact ? '' : 'Followed'}
                </button>

                <button
                    onClick={() => onUpdateStatus(streak.id, 'BROKEN')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all active:scale-95",
                        status === 'BROKEN'
                            ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                            : "bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-red-500 hover:text-red-500"
                    )}
                >
                    <X size={18} />
                    {compact ? '' : 'Broken'}
                </button>

                <button
                    onClick={() => onUpdateStatus(streak.id, 'SKIP')}
                    className={cn(
                        "flex-none w-10 flex items-center justify-center rounded-xl transition-all active:scale-95",
                        status === 'SKIP'
                            ? "bg-gray-500 text-white"
                            : "bg-gray-100 dark:bg-zinc-900 text-gray-400 hover:bg-gray-200"
                    )}
                    title="Skip (Day Off)"
                >
                    <Minus size={18} />
                </button>
            </div>
        </motion.div>
    );
}
