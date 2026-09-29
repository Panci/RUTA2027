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

    const messages = await prisma.messageBank.findMany({
      where: { campaignId },
      include: { district: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(messages);
  } catch (err: any) {
    console.error('Error fetching messages:', err);
    return NextResponse.json({ error: err.message || 'Error del servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const activeRole = await getActiveRole();
    if (!permissions.canManageMessages(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol actual no tiene permisos para crear mensajes o argumentarios.' },
        { status: 403 }
      );
    }

    const campaignId = await getActiveCampaignId();
    if (!campaignId) {
      return NextResponse.json({ error: 'No hay campaña activa.' }, { status: 400 });
    }

    const body = await req.json();
    const { category, title, content, districtId } = body;

    if (!category || !title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: 'Categoría, título y contenido son obligatorios.' },
        { status: 400 }
      );
    }

    if (districtId) {
      const dist = await prisma.district.findUnique({ where: { id: districtId } });
      if (!dist || dist.campaignId !== campaignId) {
        return NextResponse.json({ error: 'Distrito no válido para esta campaña.' }, { status: 400 });
      }
    }

    const created = await prisma.messageBank.create({
      data: {
        campaignId,
        category,
        title: title.trim(),
        content: content.trim(),
        districtId: districtId || null,
      },
      include: {
        district: true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error('Error creating message:', err);
    return NextResponse.json({ error: err.message || 'Error al crear mensaje' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const activeRole = await getActiveRole();
    if (!permissions.canManageMessages(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol actual no tiene permisos para editar mensajes o argumentarios.' },
        { status: 403 }
      );
    }

    const campaignId = await getActiveCampaignId();
    if (!campaignId) {
      return NextResponse.json({ error: 'No hay campaña activa.' }, { status: 400 });
    }

    const body = await req.json();
    const { id, category, title, content, districtId } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de mensaje requerido.' }, { status: 400 });
    }

    const existing = await prisma.messageBank.findUnique({
      where: { id },
    });

    if (!existing || existing.campaignId !== campaignId) {
      return NextResponse.json(
        { error: 'Mensaje no encontrado en la campaña activa.' },
        { status: 404 }
      );
    }

    if (districtId) {
      const dist = await prisma.district.findUnique({ where: { id: districtId } });
      if (!dist || dist.campaignId !== campaignId) {
        return NextResponse.json({ error: 'Distrito no válido para esta campaña.' }, { status: 400 });
      }
    }

    const updated = await prisma.messageBank.update({
      where: { id },
      data: {
        category: category ?? existing.category,
        title: title !== undefined ? title.trim() : existing.title,
        content: content !== undefined ? content.trim() : existing.content,
        districtId: districtId !== undefined ? (districtId || null) : existing.districtId,
      },
      include: {
        district: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('Error updating message:', err);
    return NextResponse.json({ error: err.message || 'Error al actualizar mensaje' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const activeRole = await getActiveRole();
    if (!permissions.canManageMessages(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol actual no tiene permisos para eliminar mensajes o argumentarios.' },
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
      return NextResponse.json({ error: 'ID requerido.' }, { status: 400 });
    }

    const existing = await prisma.messageBank.findUnique({
      where: { id },
    });

    if (!existing || existing.campaignId !== campaignId) {
      return NextResponse.json(
        { error: 'Mensaje no encontrado en la campaña activa.' },
        { status: 404 }
      );
    }

    await prisma.messageBank.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting message:', err);
    return NextResponse.json({ error: err.message || 'Error al eliminar mensaje' }, { status: 500 });
  }
}
