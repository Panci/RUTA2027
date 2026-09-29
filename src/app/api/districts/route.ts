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

    const districts = await prisma.district.findMany({
      where: { campaignId },
      orderBy: { code: 'asc' },
    });

    return NextResponse.json(districts);
  } catch (err: any) {
    console.error('Error fetching districts:', err);
    return NextResponse.json({ error: err.message || 'Error del servidor' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const activeRole = await getActiveRole();
    if (!permissions.canClassifyDistricts(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol actual no tiene permisos para editar la configuración de distritos.' },
        { status: 403 }
      );
    }

    const campaignId = await getActiveCampaignId();
    if (!campaignId) {
      return NextResponse.json({ error: 'No hay campaña activa.' }, { status: 400 });
    }

    const body = await req.json();
    const { id, name, strategicGoal, mainIssues, targetAudience, territorialFeatures, risksOpportunities } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de distrito requerido.' }, { status: 400 });
    }

    const existing = await prisma.district.findUnique({
      where: { id },
    });

    if (!existing || existing.campaignId !== campaignId) {
      return NextResponse.json(
        { error: 'Distrito no encontrado en la campaña activa.' },
        { status: 404 }
      );
    }

    const updated = await prisma.district.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        strategicGoal: strategicGoal !== undefined ? (strategicGoal?.trim() || null) : existing.strategicGoal,
        mainIssues: mainIssues !== undefined ? (mainIssues?.trim() || null) : existing.mainIssues,
        targetAudience: targetAudience !== undefined ? (targetAudience?.trim() || null) : existing.targetAudience,
        territorialFeatures: territorialFeatures !== undefined ? (territorialFeatures?.trim() || null) : existing.territorialFeatures,
        risksOpportunities: risksOpportunities !== undefined ? (risksOpportunities?.trim() || null) : existing.risksOpportunities,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('Error updating district:', err);
    return NextResponse.json({ error: err.message || 'Error al actualizar el distrito' }, { status: 500 });
  }
}
