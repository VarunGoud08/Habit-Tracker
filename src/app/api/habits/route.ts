import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const habits = await prisma.habit.findMany({
            orderBy: { createdAt: 'asc' },
        });
        return NextResponse.json(habits);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const habit = await prisma.habit.create({
            data: {
                name: body.name,
                description: body.description,
                category: body.category,
                points: parseInt(body.points),
                missedPoints: parseInt(body.missedPoints),
                isActive: body.isActive ?? true,
            },
        });
        return NextResponse.json(habit);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 });
    }
}
