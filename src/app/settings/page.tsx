'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, RefreshCw, Save } from 'lucide-react';

export default function SettingsPage() {
    const [resetting, setResetting] = useState(false);

    const handleReset = async () => {
        if (!confirm("Are you sure? This will delete ALL daily logs. This cannot be undone.")) return;

        setResetting(true);
        try {
            // We need an API for this
            await fetch('/api/settings/reset', { method: 'POST' });
            alert("All data has been reset.");
        } catch (e) {
            alert("Failed to reset data");
        } finally {
            setResetting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Settings</h1>
                <p className="text-gray-500">Manage your tracking preferences and data.</p>
            </div>

            <div className="glass-panel p-6 space-y-8">
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Trash2 size={20} className="text-red-500" />
                        Danger Zone
                    </h2>
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="font-bold text-red-700 dark:text-red-400">Quarterly Reset</p>
                            <p className="text-sm text-red-600/70 dark:text-red-400/70">Clear all daily tracking data but keep lifetime stats.</p>
                        </div>
                        <button
                            onClick={handleReset}
                            disabled={resetting}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                            {resetting ? 'Resetting...' : 'Reset Data'}
                        </button>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Save size={20} />
                        Export Data
                    </h2>
                    <div className="p-4 border border-gray-100 dark:border-zinc-800 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="font-bold">Export JSON</p>
                            <p className="text-sm text-gray-500">Download a copy of your tracking history.</p>
                        </div>
                        <button
                            className="px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                            onClick={() => {
                                window.open('/api/history', '_blank');
                            }}
                        >
                            Download
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
