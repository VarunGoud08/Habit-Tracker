import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const streak = await prisma.streak.update({
            where: { id: params.id },
            data: {
                name: body.name,
                description: body.description,
                type: body.type,
                isActive: body.isActive,
            },
        });
        return NextResponse.json(streak);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update streak' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.streak.delete({
            where: { id: params.id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete streak' }, { status: 500 });
    }
}
