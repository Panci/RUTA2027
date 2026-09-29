import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { ACTIVE_CAMPAIGN_COOKIE } from '@/lib/campaign-context';
import { getActiveRole, permissions } from '@/lib/permissions-server';

export async function POST(req: NextRequest) {
  try {
    const activeRole = await getActiveRole();
    if (!permissions.canSwitchAllMunicipalities(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol actual solo tiene acceso a su municipio asignado.' },
        { status: 403 }
      );
    }

    const { campaignId } = await req.json();

    if (!campaignId) {
      return NextResponse.json({ error: 'campaignId es requerido.' }, { status: 400 });
    }

    const exists = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, name: true, municipality: true },
    });

    if (!exists) {
      return NextResponse.json({ error: 'El municipio/campaña no existe.' }, { status: 404 });
    }

    const cookieStore = cookies();
    cookieStore.set(ACTIVE_CAMPAIGN_COOKIE, campaignId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });

    return NextResponse.json({
      success: true,
      selectedCampaign: exists,
    });
  } catch (err: any) {
    console.error('Error al seleccionar municipio:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
