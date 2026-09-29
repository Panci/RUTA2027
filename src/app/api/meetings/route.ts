import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getActiveCampaignId } from '@/lib/campaign-context';
import { getActiveRole, permissions } from '@/lib/permissions-server';
import { getSession } from '@/lib/auth';
import { MeetingSchema, MeetingUpdateSchema } from '@/lib/validations';

export async function GET() {
  try {
    const campaignId = await getActiveCampaignId();
    if (!campaignId) {
      return NextResponse.json({ error: 'No existe campaña activa' }, { status: 400 });
    }

    const meetings = await prisma.weeklyMeeting.findMany({
      where: { campaignId },
      orderBy: { meetingDate: 'desc' },
    });

    return NextResponse.json(meetings);
  } catch (error: any) {
    console.error('Error al listar reuniones:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

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
    if (!permissions.canManageMeetings(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol no tiene permisos para crear o gestionar reuniones de comité.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parseResult = MeetingSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Datos del acta no válidos.' },
        { status: 400 }
      );
    }

    const { meetingDate, agenda, decisionsTaken, roadblocks, risksDetected, priorityChanges } =
      parseResult.data;

    const campaignId = await getActiveCampaignId();
    if (!campaignId) {
      return NextResponse.json({ error: 'No existe campaña activa' }, { status: 400 });
    }

    const newMeeting = await prisma.weeklyMeeting.create({
      data: {
        campaignId,
        meetingDate,
        agenda,
        decisionsTaken,
        roadblocks: roadblocks || null,
        risksDetected: risksDetected || null,
        priorityChanges: priorityChanges || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        campaignId,
        userId: session.id,
        userName: session.name,
        action: 'CREATE',
        resource: 'Reuniones de Comité',
        details: `Nueva acta registrada por ${session.name} para la fecha ${newMeeting.meetingDate.toISOString().split('T')[0]}`,
      },
    });

    return NextResponse.json(newMeeting, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear reunión:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
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
    if (!permissions.canManageMeetings(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol no tiene permisos para editar reuniones de comité.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parseResult = MeetingUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Datos del acta no válidos.' },
        { status: 400 }
      );
    }

    const { id, meetingDate, agenda, decisionsTaken, roadblocks, risksDetected, priorityChanges } =
      parseResult.data;

    const campaignId = await getActiveCampaignId();
    if (!campaignId) {
      return NextResponse.json({ error: 'No existe campaña activa' }, { status: 400 });
    }

    const existing = await prisma.weeklyMeeting.findFirst({
      where: { id, campaignId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Acta de reunión no encontrada o no pertenece a la campaña' }, { status: 404 });
    }

    const updatedMeeting = await prisma.weeklyMeeting.update({
      where: { id },
      data: {
        meetingDate,
        agenda,
        decisionsTaken,
        roadblocks: roadblocks || null,
        risksDetected: risksDetected || null,
        priorityChanges: priorityChanges || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        campaignId,
        userId: session.id,
        userName: session.name,
        action: 'UPDATE',
        resource: 'Reuniones de Comité',
        details: `Acta de reunión (${id}) actualizada por ${session.name}`,
      },
    });

    return NextResponse.json(updatedMeeting);
  } catch (error: any) {
    console.error('Error al actualizar reunión:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere iniciar sesión.' },
        { status: 401 }
      );
    }

    const activeRole = await getActiveRole();
    if (!permissions.canManageMeetings(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol no tiene permisos para eliminar reuniones de comité.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'El ID de la reunión es obligatorio.' }, { status: 400 });
    }

    const campaignId = await getActiveCampaignId();
    if (!campaignId) {
      return NextResponse.json({ error: 'No existe campaña activa' }, { status: 400 });
    }

    const existing = await prisma.weeklyMeeting.findFirst({
      where: { id, campaignId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Acta no encontrada' }, { status: 404 });
    }

    await prisma.weeklyMeeting.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        campaignId,
        userId: session.id,
        userName: session.name,
        action: 'DELETE',
        resource: 'Reuniones de Comité',
        details: `Acta de reunión (${id}) eliminada por ${session.name}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error al eliminar reunión:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
