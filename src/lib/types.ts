export type HabitCategory = 'GOOD' | 'BAD';
export type HabitStatus = 'COMPLETED' | 'MISSED' | 'SKIPPED' | 'UNTRACKED';

export interface Habit {
    id: string;
    name: string;
    description?: string;
    category: HabitCategory;
    points: number;
    missedPoints: number;
    isActive: boolean;
}

export interface DayLog {
    id: string;
    date: string; // ISO string
    totalScore: number;
    entries: HabitEntry[];
}

export interface HabitEntry {
    habitId: string;
    status: HabitStatus;
}

export type StreakType = 'AVOID' | 'MAINTAIN';
export type StreakStatus = 'FOLLOWED' | 'BROKEN' | 'SKIP' | 'UNTRACKED';

export interface Streak {
    id: string;
    name: string;
    description?: string;
    type: StreakType;
    isActive: boolean;
    currentStreak: number;
    highestStreak: number;
    lastBrokenDate?: string;
}

export interface StreakLog {
    id: string;
    streakId: string;
    date: string;
    status: StreakStatus;
}
