import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const habit = await prisma.habit.update({
            where: { id: params.id },
            data: {
                name: body.name,
                description: body.description,
                category: body.category,
                points: parseInt(body.points),
                missedPoints: parseInt(body.missedPoints),
                isActive: body.isActive,
            },
        });
        return NextResponse.json(habit);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.habit.delete({
            where: { id: params.id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete habit' }, { status: 500 });
    }
}
