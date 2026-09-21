import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { ACTIVE_CAMPAIGN_COOKIE, getActiveCampaignId } from '@/lib/campaign-context';
import { getActiveRole, permissions } from '@/lib/permissions-server';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const activeRole = await getActiveRole();
    if (!permissions.canManageMunicipalities(activeRole)) {
      return NextResponse.json(
        { error: 'No dispones de permisos para eliminar municipios con tu rol actual.' },
        { status: 403 }
      );
    }

    const campaignId = params.id;

    const totalCampaigns = await prisma.campaign.count();
    if (totalCampaigns <= 1) {
      return NextResponse.json(
        { error: 'No se puede eliminar el único municipio registrado en la plataforma.' },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Municipio no encontrado.' }, { status: 404 });
    }

    // Prisma ejecutará la eliminación en cascada de todos los datos asociados
    await prisma.campaign.delete({
      where: { id: campaignId },
    });

    // Si se eliminó la campaña activa, reasignar a la primera restante
    const currentActiveId = await getActiveCampaignId();
    if (currentActiveId === campaignId) {
      const remaining = await prisma.campaign.findFirst({
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      });
      if (remaining) {
        cookies().set(ACTIVE_CAMPAIGN_COOKIE, remaining.id, {
          path: '/',
          maxAge: 60 * 60 * 24 * 365,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error al eliminar municipio:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const activeRole = await getActiveRole();
    if (!permissions.canEditSettings(activeRole)) {
      return NextResponse.json(
        { error: 'No dispones de permisos para modificar la configuración de municipios.' },
        { status: 403 }
      );
    }

    const campaignId = params.id;
    const body = await req.json();

    const updated = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        name: body.name,
        municipality: body.municipality,
        candidacyName: body.candidacyName,
        partyOrCoalition: body.partyOrCoalition,
        politicalGoal: body.politicalGoal,
        mainAdversaries: body.mainAdversaries,
        teamDescription: body.teamDescription,
        availableResources: body.availableResources,
        electionDate: body.electionDate ? new Date(body.electionDate) : undefined,
      },
    });

    return NextResponse.json({ success: true, campaign: updated });
  } catch (err: any) {
    console.error('Error al actualizar municipio:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
