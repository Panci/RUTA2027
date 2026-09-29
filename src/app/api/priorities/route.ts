import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getActiveCampaignId } from '@/lib/campaign-context';
import { getActiveRole, permissions } from '@/lib/permissions-server';

export async function GET() {
  try {
    const campaignId = await getActiveCampaignId();
    if (!campaignId) {
      return NextResponse.json({ error: 'No hay campaña activa.' }, { status: 400 });
    }

    const priorities = await prisma.campaignPriority.findMany({
      where: { campaignId },
      include: {
        actionTasks: {
          include: { district: true },
        },
      },
      orderBy: { orderNumber: 'asc' },
    });

    return NextResponse.json(priorities);
  } catch (err: any) {
    console.error('Error fetching priorities:', err);
    return NextResponse.json({ error: err.message || 'Error del servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const activeRole = await getActiveRole();
    if (!permissions.canManageStrategy(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol actual no tiene permisos para crear prioridades políticas.' },
        { status: 403 }
      );
    }

    const campaignId = await getActiveCampaignId();
    if (!campaignId) {
      return NextResponse.json({ error: 'No hay campaña activa.' }, { status: 400 });
    }

    const body = await req.json();

    if (!body.title || !body.description) {
      return NextResponse.json({ error: 'Título y descripción son obligatorios.' }, { status: 400 });
    }

    // Calcular el siguiente número de orden si no se proporciona
    let orderNumber = body.orderNumber ? parseInt(body.orderNumber, 10) : 1;
    if (!body.orderNumber) {
      const count = await prisma.campaignPriority.count({
        where: { campaignId },
      });
      orderNumber = count + 1;
    }

    const created = await prisma.campaignPriority.create({
      data: {
        campaignId,
        orderNumber,
        title: body.title.trim(),
        description: body.description.trim(),
        targetMetric: body.targetMetric?.trim() || null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error('Error creating priority:', err);
    return NextResponse.json({ error: err.message || 'Error al crear prioridad' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const activeRole = await getActiveRole();
    if (!permissions.canManageStrategy(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol actual no tiene permisos para actualizar prioridades políticas.' },
        { status: 403 }
      );
    }

    const campaignId = await getActiveCampaignId();
    if (!campaignId) {
      return NextResponse.json({ error: 'No hay campaña activa.' }, { status: 400 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de prioridad requerido.' }, { status: 400 });
    }

    const existing = await prisma.campaignPriority.findUnique({
      where: { id },
    });

    if (!existing || existing.campaignId !== campaignId) {
      return NextResponse.json({ error: 'Prioridad no encontrada en esta campaña.' }, { status: 404 });
    }

    const updated = await prisma.campaignPriority.update({
      where: { id },
      data: {
        orderNumber: data.orderNumber !== undefined ? parseInt(data.orderNumber, 10) : existing.orderNumber,
        title: data.title !== undefined ? data.title.trim() : existing.title,
        description: data.description !== undefined ? data.description.trim() : existing.description,
        targetMetric: data.targetMetric !== undefined ? data.targetMetric.trim() : existing.targetMetric,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('Error updating priority:', err);
    return NextResponse.json({ error: err.message || 'Error al actualizar prioridad' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const activeRole = await getActiveRole();
    if (!permissions.canManageStrategy(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol actual no tiene permisos para eliminar prioridades políticas.' },
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
      return NextResponse.json({ error: 'ID de prioridad requerido.' }, { status: 400 });
    }

    const existing = await prisma.campaignPriority.findUnique({
      where: { id },
    });

    if (!existing || existing.campaignId !== campaignId) {
      return NextResponse.json({ error: 'Prioridad no encontrada en esta campaña.' }, { status: 404 });
    }

    await prisma.campaignPriority.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting priority:', err);
    return NextResponse.json({ error: err.message || 'Error al eliminar prioridad' }, { status: 500 });
  }
}
