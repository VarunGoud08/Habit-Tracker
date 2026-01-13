'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Flame } from 'lucide-react';

interface StreakFormProps {
    onClose: () => void;
    onSave: () => void;
    initialData?: any;
}

export default function StreakForm({ onClose, onSave, initialData }: StreakFormProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        type: initialData?.type || 'AVOID', // AVOID or MAINTAIN
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const method = initialData ? 'PUT' : 'POST';
        const url = initialData ? `/api/streaks/${initialData.id}` : '/api/streaks';

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
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg text-orange-500"><Flame size={20} /></div>
                        <h2 className="text-xl font-bold">{initialData ? 'Edit Streak' : 'New Streak'}</h2>
                    </div>
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
                            placeholder="e.g. No Sugar"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'AVOID' })}
                                className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${formData.type === 'AVOID' ? 'border-orange-500 bg-orange-50 text-orange-600 dark:bg-orange-900/10' : 'border-transparent bg-gray-50 text-gray-400'}`}
                            >
                                AVOID
                                <span className="block text-[10px] font-normal opacity-70">Bad habits (e.g. Junk Food)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'MAINTAIN' })}
                                className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${formData.type === 'MAINTAIN' ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/10' : 'border-transparent bg-gray-50 text-gray-400'}`}
                            >
                                MAINTAIN
                                <span className="block text-[10px] font-normal opacity-70">Good habits (e.g. Reading)</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                        <textarea
                            className="input-field min-h-[80px] py-3"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Rules for this streak..."
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 dark:bg-zinc-900 rounded-xl font-medium">Cancel</button>
                        <button disabled={loading} type="submit" className="flex-1 py-3 bg-black text-white dark:bg-white dark:text-black rounded-xl font-medium">
                            {loading ? 'Saving...' : 'Start Streak'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
