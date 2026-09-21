import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getActiveRole, permissions, getCurrentUser } from '@/lib/permissions-server';

export async function PATCH(request: Request) {
  try {
    const activeRole = await getActiveRole();
    if (!permissions.canChangeTaskStatus(activeRole)) {
      return NextResponse.json(
        { error: 'No dispones de permisos para modificar el estado de hitos con tu rol actual.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, isCompleted } = body;

    if (!id || typeof isCompleted !== 'boolean') {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const updated = await prisma.milestone.update({
      where: { id },
      data: { isCompleted },
      include: { phase: true },
    });

    const user = await getCurrentUser();
    await prisma.auditLog.create({
      data: {
        campaignId: updated.phase.campaignId,
        userId: user?.id,
        userName: user?.name || 'Usuario Autenticado',
        action: 'UPDATE',
        resource: 'Hoja de Ruta / Hitos',
        details: `Hito "${updated.title}" marcado como ${isCompleted ? 'COMPLETADO' : 'PENDIENTE'}`,
      },
    });

    return NextResponse.json({ success: true, milestone: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
