'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface HabitFormProps {
    onClose: () => void;
    onSave: () => void;
    initialData?: any;
}

export default function HabitForm({ onClose, onSave, initialData }: HabitFormProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        category: initialData?.category || 'GOOD',
        points: initialData?.points || 10,
        missedPoints: initialData?.missedPoints || 0, // 0 or negative
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Auto-adjust logic for "BAD" habits if needed
        // "BAD habits: Give negative points if done"
        // User might enter 10. We should probably clarify in UI or backend.

        const method = initialData ? 'PUT' : 'POST';
        const url = initialData ? `/api/habits/${initialData.id}` : '/api/habits';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        setLoading(false);
        onSave();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-black w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-zinc-800"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">{initialData ? 'Edit Habit' : 'New Habit'}</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                        <input
                            required
                            className="input-field"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Morning Run"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                            <select
                                className="input-field"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="GOOD">Positive Habit</option>
                                <option value="BAD">Negative Habit</option>
                            </select>
                        </div>

                        {/* Logic change based on Category */}
                        {formData.category === 'GOOD' ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Points (Done)</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={formData.points}
                                        onChange={e => setFormData({ ...formData, points: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Penalty (Missed)</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={formData.missedPoints}
                                        onChange={e => setFormData({ ...formData, missedPoints: parseInt(e.target.value) })}
                                        placeholder="-5"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Points deducted if you miss this habit.</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Cost (Done)</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={formData.points} // This is how much it costs you if you DO IT. Often negative.
                                        onChange={e => setFormData({ ...formData, points: parseInt(e.target.value) })}
                                        placeholder="-10"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">E.g. -10 points if you smoke.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Reward (Avoided)</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={formData.missedPoints} // Confusing name in schema but logical flow: "Action Missed" for Bad Habit = Good Thing
                                        onChange={e => setFormData({ ...formData, missedPoints: parseInt(e.target.value) })}
                                        placeholder="5"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                        <textarea
                            className="input-field min-h-[80px] py-3"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Why this habit matters..."
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 dark:bg-zinc-900 rounded-xl font-medium">Cancel</button>
                        <button disabled={loading} type="submit" className="flex-1 py-3 bg-black text-white dark:bg-white dark:text-black rounded-xl font-medium">
                            {loading ? 'Saving...' : 'Save Habit'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
