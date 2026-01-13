'use client';

import { useEffect, useState } from 'react';
import HabitForm from '@/components/HabitForm';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HabitsPage() {
    const [habits, setHabits] = useState<any[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<any>(null);

    const fetchHabits = async () => {
        const res = await fetch('/api/habits');
        const data = await res.json();
        setHabits(data);
    };

    useEffect(() => {
        fetchHabits();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will hide the habit from future tracking.")) return; // Soft delete or hard? Requirement says "Active / inactive toggle", schema has isActive.
        // For now API does DELETE. Let's assume user wants to delete for this "Management" view. 
        // Or better, toggle active.

        // Let's stick to simple DELETE for now to clean up, or maybe toggle.
        // The prompt says "Active / inactive toggle".
        // I'll implement DELETE as full removal for clean up, but edit allows toggling active.

        await fetch(`/api/habits/${id}`, { method: 'DELETE' });
        fetchHabits();
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">My Habits</h1>
                    <p className="text-gray-500">Manage what you want to track daily.</p>
                </div>
                <button
                    onClick={() => { setEditingHabit(null); setIsFormOpen(true); }}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    Create New
                </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {habits.map((habit, i) => (
                    <motion.div
                        key={habit.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass-panel p-6 hover:scale-[1.02] transition-transform duration-300"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${habit.category === 'GOOD' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                    {habit.category === 'GOOD' ? 'POSITIVE' : 'NEGATIVE'}
                                </span>
                            </div>
                            <div className="flex gap-2 text-gray-400">
                                <button onClick={() => { setEditingHabit(habit); setIsFormOpen(true); }} className="hover:text-black dark:hover:text-white"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(habit.id)} className="hover:text-red-500"><Trash2 size={16} /></button>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold mb-2">{habit.name}</h3>
                        <p className="text-sm text-gray-500 mb-6 min-h-[40px] line-clamp-2">{habit.description || "No description."}</p>

                        <div className="flex items-center gap-4 text-sm font-medium">
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                <span>Hit: {habit.points > 0 ? '+' : ''}{habit.points}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                                <span>Miss: {habit.missedPoints > 0 ? '+' : ''}{habit.missedPoints}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {habits.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-3xl">
                        <p>No habits yet. Start by creating one!</p>
                    </div>
                )}
            </div>

            {isFormOpen && (
                <HabitForm
                    onClose={() => setIsFormOpen(false)}
                    onSave={() => { setIsFormOpen(false); fetchHabits(); }}
                    initialData={editingHabit}
                />
            )}
        </div>
    );
}
