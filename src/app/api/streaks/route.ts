import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const streaks = await prisma.streak.findMany({
            orderBy: { createdAt: 'asc' },
        });
        return NextResponse.json(streaks);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch streaks' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const streak = await prisma.streak.create({
            data: {
                name: body.name,
                description: body.description,
                type: body.type, // AVOID or MAINTAIN
                isActive: body.isActive ?? true,
                // Start new streak metrics
                currentStreak: 0,
                highestStreak: 0,
                startDate: new Date(),
            },
        });
        return NextResponse.json(streak);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create streak' }, { status: 500 });
    }
}
