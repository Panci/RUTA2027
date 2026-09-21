import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getActiveCampaignId } from '@/lib/campaign-context';

export async function POST(request: Request) {
  try {
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
        userName: 'Director de Campaña',
        action: 'CREATE',
        resource: 'Acciones / Tareas',
        details: `Nueva acción creada: "${newTask.title}" [${newTask.type}]`,
      },
    });

    return NextResponse.json({ success: true, task: newTask });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID y estado son requeridos' }, { status: 400 });
    }

    const updated = await prisma.actionTask.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, task: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
