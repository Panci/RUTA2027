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

    const logs = await prisma.competitorTracking.findMany({
      where: {
        party: { campaignId },
      },
      include: {
        party: true,
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(logs);
  } catch (err: any) {
    console.error('Error fetching competitor logs:', err);
    return NextResponse.json({ error: err.message || 'Error del servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const activeRole = await getActiveRole();
    if (!permissions.canManageCompetitors(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol actual no tiene permisos para registrar movimientos en el radar de competidores.' },
        { status: 403 }
      );
    }

    const campaignId = await getActiveCampaignId();
    if (!campaignId) {
      return NextResponse.json({ error: 'No hay campaña activa.' }, { status: 400 });
    }

    const body = await req.json();
    const { partyId, type, title, description, opportunityToDifferentiate, date } = body;

    if (!partyId || !title || !description) {
      return NextResponse.json(
        { error: 'Partido rival, título y descripción son obligatorios.' },
        { status: 400 }
      );
    }

    // Comprobar que el partido pertenece a la campaña activa
    const party = await prisma.party.findUnique({
      where: { id: partyId },
    });

    if (!party || party.campaignId !== campaignId) {
      return NextResponse.json(
        { error: 'El partido seleccionado no pertenece a la campaña activa.' },
        { status: 400 }
      );
    }

    const created = await prisma.competitorTracking.create({
      data: {
        partyId,
        type: type || 'STATEMENT',
        title,
        description,
        opportunityToDifferentiate: opportunityToDifferentiate || null,
        date: date ? new Date(date) : new Date(),
      },
      include: {
        party: true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error('Error creating competitor log:', err);
    return NextResponse.json({ error: err.message || 'Error al registrar movimiento' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const activeRole = await getActiveRole();
    if (!permissions.canManageCompetitors(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol actual no tiene permisos para editar movimientos en el radar de competidores.' },
        { status: 403 }
      );
    }

    const campaignId = await getActiveCampaignId();
    if (!campaignId) {
      return NextResponse.json({ error: 'No hay campaña activa.' }, { status: 400 });
    }

    const body = await req.json();
    const { id, partyId, type, title, description, opportunityToDifferentiate, date } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de registro requerido.' }, { status: 400 });
    }

    const existing = await prisma.competitorTracking.findUnique({
      where: { id },
      include: { party: true },
    });

    if (!existing || existing.party.campaignId !== campaignId) {
      return NextResponse.json(
        { error: 'Registro de rival no encontrado en la campaña activa.' },
        { status: 404 }
      );
    }

    if (partyId && partyId !== existing.partyId) {
      const party = await prisma.party.findUnique({ where: { id: partyId } });
      if (!party || party.campaignId !== campaignId) {
        return NextResponse.json({ error: 'Partido rival no válido.' }, { status: 400 });
      }
    }

    const updated = await prisma.competitorTracking.update({
      where: { id },
      data: {
        partyId: partyId ?? existing.partyId,
        type: type ?? existing.type,
        title: title ?? existing.title,
        description: description ?? existing.description,
        opportunityToDifferentiate: opportunityToDifferentiate !== undefined ? (opportunityToDifferentiate || null) : existing.opportunityToDifferentiate,
        date: date ? new Date(date) : existing.date,
      },
      include: {
        party: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('Error updating competitor log:', err);
    return NextResponse.json({ error: err.message || 'Error al actualizar movimiento' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const activeRole = await getActiveRole();
    if (!permissions.canManageCompetitors(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol actual no tiene permisos para eliminar movimientos en el radar de competidores.' },
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

    const existing = await prisma.competitorTracking.findUnique({
      where: { id },
      include: { party: true },
    });

    if (!existing || existing.party.campaignId !== campaignId) {
      return NextResponse.json(
        { error: 'Registro no encontrado en la campaña activa.' },
        { status: 404 }
      );
    }

    await prisma.competitorTracking.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting competitor log:', err);
    return NextResponse.json({ error: err.message || 'Error al eliminar movimiento' }, { status: 500 });
  }
}
