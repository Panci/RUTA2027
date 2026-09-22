import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getActiveCampaignId } from '@/lib/campaign-context';
import { getActiveRole, permissions } from '@/lib/permissions-server';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere iniciar sesión.' },
        { status: 401 }
      );
    }

    const activeRole = await getActiveRole();
    if (!permissions.canCreateTasks(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol actual no tiene permisos para crear acciones o tareas.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, districtId, priorityId, type, dueDate, targetAudience, keyMessage, competitorPartyId } = body;

    if (!title || !dueDate) {
      return NextResponse.json({ error: 'El título y la fecha son obligatorios' }, { status: 400 });
    }

    const campaignId = await getActiveCampaignId();
    if (!campaignId) {
      return NextResponse.json({ error: 'No existe campaña activa' }, { status: 400 });
    }

    const newTask = await prisma.actionTask.create({
      data: {
        campaignId,
        title,
        description,
        districtId: districtId || null,
        priorityId: priorityId || null,
        competitorPartyId: competitorPartyId || null,
        responsibleId: session.id,
        type: type || 'TASK',
        dueDate: new Date(dueDate),
        targetAudience,
        keyMessage,
        status: 'PENDING',
      },
      include: {
        district: true,
        priority: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        campaignId,
        userId: session.id,
        userName: session.name,
        action: 'CREATE',
        resource: 'Acciones / Tareas',
        details: `Nueva acción creada por ${session.name}: "${newTask.title}" [${newTask.type}]`,
      },
    });

    return NextResponse.json({ success: true, task: newTask });
  } catch (error: any) {
    console.error('Error al crear tarea:', error);
    return NextResponse.json(
      { error: 'Error interno al crear la tarea.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere iniciar sesión.' },
        { status: 401 }
      );
    }

    const activeRole = await getActiveRole();
    if (!permissions.canChangeTaskStatus(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol actual es de solo lectura y no puede cambiar estados.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID y estado son requeridos' }, { status: 400 });
    }

    const campaignId = await getActiveCampaignId();
    if (!campaignId) {
      return NextResponse.json({ error: 'No existe campaña activa' }, { status: 400 });
    }

    // Aislamiento multi-inquilino: verificar existencia y pertenencia a la campaña activa
    const existingTask = await prisma.actionTask.findUnique({
      where: { id },
      select: { id: true, campaignId: true, title: true, status: true },
    });

    if (!existingTask || existingTask.campaignId !== campaignId) {
      return NextResponse.json(
        { error: 'Tarea no encontrada o no pertenece a la campaña activa.' },
        { status: 404 }
      );
    }

    const updated = await prisma.actionTask.update({
      where: { id },
      data: { status },
    });

    // Registrar en auditoría el cambio de estado con el usuario autenticado real
    await prisma.auditLog.create({
      data: {
        campaignId,
        userId: session.id,
        userName: session.name,
        action: 'UPDATE',
        resource: 'Acciones / Tareas',
        details: `Estado de la tarea "${existingTask.title}" actualizado de [${existingTask.status}] a [${status}] por ${session.name}`,
      },
    });

    return NextResponse.json({ success: true, task: updated });
  } catch (error: any) {
    console.error('Error al actualizar tarea:', error);
    return NextResponse.json(
      { error: 'Error interno al actualizar la tarea.' },
      { status: 500 }
    );
  }
}
