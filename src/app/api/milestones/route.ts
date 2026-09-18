import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, isCompleted } = body;

    if (!id || typeof isCompleted !== 'boolean') {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const updated = await prisma.milestone.update({
      where: { id },
      data: { isCompleted },
    });

    return NextResponse.json({ success: true, milestone: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
