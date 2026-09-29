import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getActiveCampaignId } from '@/lib/campaign-context';
import { getActiveRole, permissions, getCurrentUser } from '@/lib/permissions-server';

export async function POST(req: NextRequest) {
  try {
    const activeRole = await getActiveRole();
    if (!permissions.canManageRoadmap(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol actual no tiene permisos para crear hitos en la hoja de ruta.' },
        { status: 403 }
      );
    }

    const campaignId = await getActiveCampaignId();
    if (!campaignId) {
      return NextResponse.json({ error: 'No hay campaña activa.' }, { status: 400 });
    }

    const body = await req.json();
    const { phaseId, title, dueDate } = body;

    if (!phaseId || !title?.trim() || !dueDate) {
      return NextResponse.json(
        { error: 'Fase, título y fecha límite son obligatorios.' },
        { status: 400 }
      );
    }

    const phase = await prisma.roadmapPhase.findUnique({
      where: { id: phaseId },
    });

    if (!phase || phase.campaignId !== campaignId) {
      return NextResponse.json(
        { error: 'La fase seleccionada no pertenece a la campaña activa.' },
        { status: 400 }
      );
    }

    const milestone = await prisma.milestone.create({
      data: {
        phaseId,
        title: title.trim(),
        dueDate: new Date(dueDate),
        isCompleted: false,
      },
      include: {
        phase: true,
      },
    });

    const user = await getCurrentUser();
    await prisma.auditLog.create({
      data: {
        campaignId,
        userId: user?.id,
        userName: user?.name || 'Usuario',
        action: 'CREATE',
        resource: 'Hoja de Ruta / Hitos',
        details: `Nuevo hito creado en la fase "${phase.name}": "${milestone.title}"`,
      },
    });

    return NextResponse.json(milestone, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear hito:', error);
    return NextResponse.json({ error: error.message || 'Error al crear el hito.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const activeRole = await getActiveRole();
    if (!permissions.canManageRoadmap(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol actual no tiene permisos para editar hitos de la hoja de ruta.' },
        { status: 403 }
      );
    }

    const campaignId = await getActiveCampaignId();
    if (!campaignId) {
      return NextResponse.json({ error: 'No hay campaña activa.' }, { status: 400 });
    }

    const body = await req.json();
    const { id, title, dueDate, isCompleted, phaseId } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de hito requerido.' }, { status: 400 });
    }

    const existing = await prisma.milestone.findUnique({
      where: { id },
      include: { phase: true },
    });

    if (!existing || existing.phase.campaignId !== campaignId) {
      return NextResponse.json(
        { error: 'Hito no encontrado en la campaña activa.' },
        { status: 404 }
      );
    }

    const updated = await prisma.milestone.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : existing.title,
        dueDate: dueDate ? new Date(dueDate) : existing.dueDate,
        isCompleted: typeof isCompleted === 'boolean' ? isCompleted : existing.isCompleted,
        phaseId: phaseId ?? existing.phaseId,
      },
      include: {
        phase: true,
      },
    });

    const user = await getCurrentUser();
    await prisma.auditLog.create({
      data: {
        campaignId,
        userId: user?.id,
        userName: user?.name || 'Usuario',
        action: 'UPDATE',
        resource: 'Hoja de Ruta / Hitos',
        details: `Hito "${updated.title}" actualizado`,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error al actualizar hito:', error);
    return NextResponse.json({ error: error.message || 'Error al actualizar el hito.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const activeRole = await getActiveRole();
    if (!permissions.canManageRoadmap(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol actual no tiene permisos para eliminar hitos de la hoja de ruta.' },
        { status: 403 }
      );
    }

    const campaignId = await getActiveCampaignId();
    if (!campaignId) {
      return NextResponse.json({ error: 'No hay campaña activa.' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de hito requerido.' }, { status: 400 });
    }

    const existing = await prisma.milestone.findUnique({
      where: { id },
      include: { phase: true },
    });

    if (!existing || existing.phase.campaignId !== campaignId) {
      return NextResponse.json(
        { error: 'Hito no encontrado en la campaña activa.' },
        { status: 404 }
      );
    }

    await prisma.milestone.delete({
      where: { id },
    });

    const user = await getCurrentUser();
    await prisma.auditLog.create({
      data: {
        campaignId,
        userId: user?.id,
        userName: user?.name || 'Usuario',
        action: 'DELETE',
        resource: 'Hoja de Ruta / Hitos',
        details: `Hito "${existing.title}" eliminado de la fase "${existing.phase.name}"`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error al eliminar hito:', error);
    return NextResponse.json({ error: error.message || 'Error al eliminar el hito.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const activeRole = await getActiveRole();
    if (!permissions.canManageRoadmap(activeRole)) {
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
    console.error('Error al actualizar hito:', error);
    return NextResponse.json({ error: 'Error interno al actualizar el estado del hito.' }, { status: 500 });
  }
}
