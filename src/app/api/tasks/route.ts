import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getActiveCampaignId } from '@/lib/campaign-context';
import { getActiveRole, permissions, getCurrentUser } from '@/lib/permissions-server';
import { TaskCreateSchema, TaskUpdateStatusSchema } from '@/lib/validations';

async function getOrFallbackUser() {
  const session = await getCurrentUser();
  if (session) return session;

  const dbUser = await prisma.user.findFirst();
  if (dbUser) {
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: 'CAMPAIGN_DIRECTOR' as const,
      campaignId: null,
      exp: Date.now() + 86400000,
    };
  }

  return {
    id: 'system-user',
    email: 'director@campana2027.es',
    name: 'Director de Campaña',
    role: 'CAMPAIGN_DIRECTOR' as const,
    campaignId: null,
    exp: Date.now() + 86400000,
  };
}

export async function GET() {
  try {
    const campaignId = await getActiveCampaignId();
    if (!campaignId) {
      return NextResponse.json({ error: 'No existe campaña activa' }, { status: 400 });
    }

    const tasks = await prisma.actionTask.findMany({
      where: { campaignId },
      include: {
        district: true,
        priority: true,
        responsible: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json(tasks);
  } catch (error: any) {
    console.error('Error al obtener tareas:', error);
    return NextResponse.json({ error: 'Error al obtener tareas.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getOrFallbackUser();
    const activeRole = await getActiveRole();
    if (!permissions.canCreateTasks(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol actual no tiene permisos para crear acciones o tareas.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parseResult = TaskCreateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Datos de tarea no válidos.' },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      districtId,
      priorityId,
      type,
      dueDate,
      targetAudience,
      keyMessage,
      competitorPartyId,
    } = parseResult.data;

    const campaignId = await getActiveCampaignId();
    if (!campaignId) {
      return NextResponse.json({ error: 'No existe campaña activa' }, { status: 400 });
    }

    const newTask = await prisma.actionTask.create({
      data: {
        campaignId,
        title,
        description: description || null,
        districtId: districtId || null,
        priorityId: priorityId || null,
        competitorPartyId: competitorPartyId || null,
        responsibleId: user.id !== 'system-user' ? user.id : null,
        type,
        dueDate,
        targetAudience: targetAudience || null,
        keyMessage: keyMessage || null,
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
        userId: user.id !== 'system-user' ? user.id : undefined,
        userName: user.name,
        action: 'CREATE',
        resource: 'Acciones / Tareas',
        details: `Nueva acción creada por ${user.name}: "${newTask.title}" [${newTask.type}]`,
      },
    });

    return NextResponse.json({ success: true, task: newTask });
  } catch (error: any) {
    console.error('Error al crear tarea:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar la creación de la tarea.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getOrFallbackUser();
    const activeRole = await getActiveRole();
    if (!permissions.canCreateTasks(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol actual no tiene permisos para editar acciones.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      id,
      title,
      description,
      districtId,
      priorityId,
      type,
      dueDate,
      targetAudience,
      keyMessage,
      status,
    } = body;

    if (!id || !title?.trim()) {
      return NextResponse.json({ error: 'ID y título de la acción requeridos.' }, { status: 400 });
    }

    const campaignId = await getActiveCampaignId();
    if (!campaignId) {
      return NextResponse.json({ error: 'No existe campaña activa' }, { status: 400 });
    }

    const existingTask = await prisma.actionTask.findUnique({
      where: { id },
    });

    if (!existingTask || existingTask.campaignId !== campaignId) {
      return NextResponse.json(
        { error: 'Tarea no encontrada o no pertenece a la campaña activa.' },
        { status: 404 }
      );
    }

    const updated = await prisma.actionTask.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description !== undefined ? (description?.trim() || null) : existingTask.description,
        districtId: districtId !== undefined ? (districtId || null) : existingTask.districtId,
        priorityId: priorityId !== undefined ? (priorityId || null) : existingTask.priorityId,
        type: type || existingTask.type,
        dueDate: dueDate ? new Date(dueDate) : existingTask.dueDate,
        targetAudience: targetAudience !== undefined ? (targetAudience?.trim() || null) : existingTask.targetAudience,
        keyMessage: keyMessage !== undefined ? (keyMessage?.trim() || null) : existingTask.keyMessage,
        status: status || existingTask.status,
      },
      include: {
        district: true,
        priority: true,
        responsible: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        campaignId,
        userId: user.id !== 'system-user' ? user.id : undefined,
        userName: user.name,
        action: 'UPDATE',
        resource: 'Acciones / Tareas',
        details: `Acción "${updated.title}" editada por ${user.name}`,
      },
    });

    return NextResponse.json({ success: true, task: updated });
  } catch (error: any) {
    console.error('Error al editar tarea:', error);
    return NextResponse.json(
      { error: 'Error interno al editar la tarea.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getOrFallbackUser();
    const activeRole = await getActiveRole();
    if (!permissions.canCreateTasks(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol actual no tiene permisos para eliminar acciones.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ error: 'ID de acción requerido.' }, { status: 400 });
    }

    const campaignId = await getActiveCampaignId();
    if (!campaignId) {
      return NextResponse.json({ error: 'No existe campaña activa' }, { status: 400 });
    }

    const existingTask = await prisma.actionTask.findUnique({
      where: { id },
    });

    if (!existingTask || existingTask.campaignId !== campaignId) {
      return NextResponse.json(
        { error: 'Tarea no encontrada o no pertenece a la campaña activa.' },
        { status: 404 }
      );
    }

    await prisma.actionTask.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        campaignId,
        userId: user.id !== 'system-user' ? user.id : undefined,
        userName: user.name,
        action: 'DELETE',
        resource: 'Acciones / Tareas',
        details: `Acción "${existingTask.title}" eliminada por ${user.name}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error al eliminar tarea:', error);
    return NextResponse.json(
      { error: 'Error interno al eliminar la tarea.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getOrFallbackUser();
    const activeRole = await getActiveRole();
    if (!permissions.canChangeTaskStatus(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol actual es de solo lectura y no puede cambiar estados.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parseResult = TaskUpdateStatusSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Datos de actualización no válidos.' },
        { status: 400 }
      );
    }

    const { id, status } = parseResult.data;

    const campaignId = await getActiveCampaignId();
    if (!campaignId) {
      return NextResponse.json({ error: 'No existe campaña activa' }, { status: 400 });
    }

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

    await prisma.auditLog.create({
      data: {
        campaignId,
        userId: user.id !== 'system-user' ? user.id : undefined,
        userName: user.name,
        action: 'UPDATE',
        resource: 'Acciones / Tareas',
        details: `Estado de la tarea "${existingTask.title}" actualizado de [${existingTask.status}] a [${status}] por ${user.name}`,
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
