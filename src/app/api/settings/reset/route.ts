import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
    try {
        // Delete all day logs
        // This cascades to HabitEntries
        await prisma.dayLog.deleteMany({});

        // We do NOT delete Habits, only the logs

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to reset data' }, { status: 500 });
    }
}
