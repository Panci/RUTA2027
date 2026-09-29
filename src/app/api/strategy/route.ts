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

    const strategy = await prisma.campaignStrategy.findUnique({
      where: { campaignId },
    });

    return NextResponse.json(strategy);
  } catch (err: any) {
    console.error('Error fetching strategy:', err);
    return NextResponse.json({ error: err.message || 'Error del servidor' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const activeRole = await getActiveRole();
    if (!permissions.canManageStrategy(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol actual no tiene permisos para modificar la estrategia central.' },
        { status: 403 }
      );
    }

    const campaignId = await getActiveCampaignId();
    if (!campaignId) {
      return NextResponse.json({ error: 'No hay campaña activa.' }, { status: 400 });
    }

    const body = await req.json();

    const strategy = await prisma.campaignStrategy.upsert({
      where: { campaignId },
      create: {
        campaignId,
        mainGoal: body.mainGoal || 'Ganar las elecciones municipales',
        targetAudience: body.targetAudience || 'Vecinos y familias del municipio',
        brandIdea1: body.brandIdea1 || '',
        brandIdea2: body.brandIdea2 || '',
        brandIdea3: body.brandIdea3 || '',
        messagesToRepeat: body.messagesToRepeat || '',
        topicsToAvoid: body.topicsToAvoid || '',
      },
      update: {
        mainGoal: body.mainGoal !== undefined ? body.mainGoal : undefined,
        targetAudience: body.targetAudience !== undefined ? body.targetAudience : undefined,
        brandIdea1: body.brandIdea1 !== undefined ? body.brandIdea1 : undefined,
        brandIdea2: body.brandIdea2 !== undefined ? body.brandIdea2 : undefined,
        brandIdea3: body.brandIdea3 !== undefined ? body.brandIdea3 : undefined,
        messagesToRepeat: body.messagesToRepeat !== undefined ? body.messagesToRepeat : undefined,
        topicsToAvoid: body.topicsToAvoid !== undefined ? body.topicsToAvoid : undefined,
      },
    });

    // También actualizamos el politicalGoal de la campaña si se modifica el mainGoal
    if (body.politicalGoal) {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { politicalGoal: body.politicalGoal },
      });
    }

    return NextResponse.json(strategy);
  } catch (err: any) {
    console.error('Error saving strategy:', err);
    return NextResponse.json({ error: err.message || 'Error al guardar la estrategia' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return PUT(req);
}
