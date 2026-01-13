'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, LineChart, List, Settings, Menu, X, Flame } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
    { label: 'Today', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Streaks', href: '/streaks', icon: Flame },
    { label: 'Calendar', href: '/history', icon: Calendar },
    { label: 'Analytics', href: '/analytics', icon: LineChart },
    { label: 'Habits', href: '/habits', icon: List },
    { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 glass-panel m-4 mb-0 sticky top-4 z-50">
                <span className="font-bold text-lg tracking-tight">Antigravity Habits</span>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden fixed inset-0 z-40 bg-white/95 dark:bg-black/95 pt-24 px-6 flex flex-col gap-4"
                    >
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-2xl text-lg font-medium transition-colors",
                                    pathname === item.href
                                        ? "bg-black text-white dark:bg-white dark:text-black"
                                        : "text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-900"
                                )}
                            >
                                <item.icon size={24} />
                                {item.label}
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 p-6 fixed h-full border-r border-gray-100 dark:border-zinc-800 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                <div className="mb-12 px-2">
                    <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                        Antigravity
                    </span>
                </div>

                <nav className="flex flex-col gap-2">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                pathname === item.href
                                    ? "bg-black text-white shadow-lg shadow-black/5 dark:bg-white dark:text-black dark:shadow-white/5"
                                    : "text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white"
                            )}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-gray-100 dark:border-zinc-800">
                    <div className="text-xs text-gray-400 px-2">
                        v1.0.0
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
                {children}
            </main>
        </div>
    );
}
