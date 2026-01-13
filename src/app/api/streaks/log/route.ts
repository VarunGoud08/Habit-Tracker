import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, subDays, isSameDay, parseISO } from 'date-fns';

export async function POST(request: Request) {
    try {
        let body;
        try {
            body = await request.json();
        } catch (e) {
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        const { streakId, date: dateString, status } = body;

        if (!streakId || !dateString || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const date = startOfDay(parseISO(dateString));

        if (!['FOLLOWED', 'BROKEN', 'SKIP'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        // 1. Log the entry
        // We upsert the log for this day
        const log = await prisma.streakLog.upsert({
            where: {
                streakId_date: {
                    streakId,
                    date
                }
            },
            update: { status },
            create: {
                streakId,
                date,
                status
            }
        });

        // 2. Recalculate Streak Metrics
        // This is the critical logic.
        // If status is BROKEN -> currentStreak = 0.
        // If status is FOLLOWED -> check yesterday. If yesterday was followed (or skipped?), increment.
        // Actually, robustness: Retrieve the streak and recent logs to be sure.

        // HOWEVER, for a simple robust system:
        // If status == BROKEN:
        //   Update Streak: currentStreak = 0, lastBrokenDate = date (if date > lastBrokenDate or null)
        // If status == FOLLOWED:
        //   We need to know if we are extending the current streak.
        //   If date is today or consecutive to previous, ++.
        //   BUT what if user goes back and edits history?
        //   Full recalculation might be safest but expensive.

        // Optimization for daily usage:
        // Fetch the Streak
        const streak = await prisma.streak.findUnique({ where: { id: streakId } });
        if (!streak) throw new Error("Streak not found");

        let newCurrentStreak = streak.currentStreak;
        let newHighestStreak = streak.highestStreak;
        let newLastBroken = streak.lastBrokenDate;
        let newStartDate = streak.startDate;

        if (status === 'BROKEN') {
            newCurrentStreak = 0;
            // Verify if this break is newer than existing break
            if (!streak.lastBrokenDate || date > streak.lastBrokenDate) {
                newLastBroken = date;
                // Start date for *NEXT* streak will be tomorrow effectively, or we let the next FOLLOWED set it?
                // Actually, if I break today, my streak is 0. Next time I do it (FOLLOWED), it becomes 1.
            }
        } else if (status === 'FOLLOWED') {
            // If we just marked today as followed:
            // We need to check if this extends the chain.
            // If this date is > (startDate + currentStreak days), we might have a gap.

            // Simpler logic:
            // If I follow today, and my streak was > 0, does this extend it?
            // Only if the previous day was tracked?
            // "If NOT TRACKED ... Does NOT break streak".
            // This means gaps are allowed? No, typical streaks break on gaps.
            // User requirements: "If NOT TRACKED: Does NOT increase streak, Does NOT break streak" -> This implies "Pause" or "Freeze".
            // So gaps are okay.

            // So, effectively, currentStreak is just a count of 'FOLLOWED' since 'lastBrokenDate' (or start).
            // Let's count all FOLLOWED entries since the last broken date (or start of time).

            const lastBreak = streak.lastBrokenDate;

            const count = await prisma.streakLog.count({
                where: {
                    streakId,
                    status: 'FOLLOWED',
                    date: {
                        gt: lastBreak || new Date('1970-01-01') // strictly after break
                    }
                }
            });

            newCurrentStreak = count;
            if (newCurrentStreak > newHighestStreak) {
                newHighestStreak = newCurrentStreak;
            }
        } else if (status === 'SKIP') {
            // Doesn't affect count, doesn't break.
            // However, if we were 10, skip, it stays 10.
            // We might need to re-run the count just in case we changed FROM followed TO skip.
            const lastBreak = streak.lastBrokenDate;

            const count = await prisma.streakLog.count({
                where: {
                    streakId,
                    status: 'FOLLOWED',
                    date: { gt: lastBreak || new Date('1970-01-01') }
                }
            });
            newCurrentStreak = count;
        }

        // Update Streak
        const updatedStreak = await prisma.streak.update({
            where: { id: streakId },
            data: {
                currentStreak: newCurrentStreak,
                highestStreak: newHighestStreak,
                lastBrokenDate: newLastBroken,
            }
        });

        return NextResponse.json({ log, streak: updatedStreak });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to log streak' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    // Get logs for a specific streak or date? 
    // Requirement: "Daily Dashboard... Show today's streaks" + "History View"
    // Let's allow fetching logs by date query or streakId query
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    const streakId = searchParams.get('streakId');

    try {
        if (dateStr) {
            const date = startOfDay(parseISO(dateStr));
            const logs = await prisma.streakLog.findMany({
                where: { date }
            });
            return NextResponse.json(logs);
        }
        if (streakId) {
            const logs = await prisma.streakLog.findMany({
                where: { streakId },
                orderBy: { date: 'asc' }
            });
            return NextResponse.json(logs);
        }
        return NextResponse.json([]);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }
}
