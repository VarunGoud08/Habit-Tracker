import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const logs = await prisma.dayLog.findMany({
            orderBy: { date: 'asc' },
            select: {
                date: true,
                totalScore: true,
            } // Minimal data for graphs
        });
        return NextResponse.json(logs);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }
}
