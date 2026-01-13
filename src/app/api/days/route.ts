import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const dateString = searchParams.get('date');

    if (!dateString) {
        return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const date = parseISO(dateString);
    /* 
       We store dates normalized to UTC or local start of day. 
       For simplicity in this localized personal app, we will use the exact ISO string provided 
       but ensure we look for the DayLog that matches that "day". 
       
       Actually, a better approach for robustness:
       The user sends '2025-01-06'. We consider that "The Day".
       We can store it as a DateTime at 00:00:00.000Z.
    */

    const start = startOfDay(date);

    try {
        let dayLog = await prisma.dayLog.findFirst({
            where: {
                date: start,
            },
            include: {
                entries: true,
            },
        });

        if (!dayLog) {
            // Return empty structure if not found (don't create on GET unless needed?)
            // Better to return null and let frontend handle "untracked" state
            return NextResponse.json(null);
        }

        return NextResponse.json(dayLog);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch daily log' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { date: dateString, entries } = body;
        const date = startOfDay(parseISO(dateString));

        // Calculate score
        // We need to fetch habits to know points
        const habits = await prisma.habit.findMany();
        let totalScore = 0;

        // Create/Update Logic
        // This is a "save the whole day" approach or "upsert".
        // For habit tracking, often updating one entry is better, but let's support full day sync.

        // However, to be precise, let's look at the entries.
        // We should probably receive { habitId, status }

        for (const entry of entries) {
            const habit = habits.find(h => h.id === entry.habitId);
            if (habit) {
                if (entry.status === 'COMPLETED') {
                    totalScore += habit.points;
                } else if (entry.status === 'MISSED') {
                    totalScore += habit.missedPoints;
                }

                // SKIPPED = 0
            }
        }

        const dayLog = await prisma.dayLog.upsert({
            where: { date: date },
            update: {
                totalScore,
                entries: {
                    deleteMany: {}, // Clear old entries to replace (simple sync)
                    create: entries.map((e: any) => ({
                        habitId: e.habitId,
                        status: e.status
                    }))
                }
            },
            create: {
                date: date,
                totalScore,
                entries: {
                    create: entries.map((e: any) => ({
                        habitId: e.habitId,
                        status: e.status
                    }))
                }
            },
            include: { entries: true }
        });

        return NextResponse.json(dayLog);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to save daily log' }, { status: 500 });
    }
}
