import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getActiveCampaignId } from '@/lib/campaign-context';

export async function GET() {
  try {
    const campaignId = await getActiveCampaignId();
    if (!campaignId) {
      return NextResponse.json({ error: 'No hay campaña activa.' }, { status: 400 });
    }

    const diagnostics = await prisma.strategicDiagnostic.findMany({
      where: { campaignId },
      include: { district: true },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(diagnostics);
  } catch (err: any) {
    console.error('Error fetching diagnostics:', err);
    return NextResponse.json({ error: err.message || 'Error del servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const campaignId = await getActiveCampaignId();
    if (!campaignId) {
      return NextResponse.json({ error: 'No hay campaña activa.' }, { status: 400 });
    }

    const body = await req.json();

    const created = await prisma.strategicDiagnostic.create({
      data: {
        campaignId,
        districtId: body.districtId || null,
        situationOverview: body.situationOverview || '',
        citizenProblems: body.citizenProblems || '',
        strengths: body.strengths || '',
        weaknesses: body.weaknesses || '',
        opportunities: body.opportunities || '',
        threats: body.threats || '',
        teamCapabilities: body.teamCapabilities || '',
        availableResources: body.availableResources || '',
      },
      include: { district: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error('Error creating diagnostic:', err);
    return NextResponse.json({ error: err.message || 'Error al crear diagnóstico' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const campaignId = await getActiveCampaignId();
    if (!campaignId) {
      return NextResponse.json({ error: 'No hay campaña activa.' }, { status: 400 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de diagnóstico requerido.' }, { status: 400 });
    }

    const existing = await prisma.strategicDiagnostic.findUnique({
      where: { id },
    });

    if (!existing || existing.campaignId !== campaignId) {
      return NextResponse.json({ error: 'Diagnóstico no encontrado en esta campaña.' }, { status: 404 });
    }

    const updated = await prisma.strategicDiagnostic.update({
      where: { id },
      data: {
        districtId: data.districtId !== undefined ? (data.districtId || null) : existing.districtId,
        situationOverview: data.situationOverview ?? existing.situationOverview,
        citizenProblems: data.citizenProblems ?? existing.citizenProblems,
        strengths: data.strengths ?? existing.strengths,
        weaknesses: data.weaknesses ?? existing.weaknesses,
        opportunities: data.opportunities ?? existing.opportunities,
        threats: data.threats ?? existing.threats,
        teamCapabilities: data.teamCapabilities ?? existing.teamCapabilities,
        availableResources: data.availableResources ?? existing.availableResources,
      },
      include: { district: true },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('Error updating diagnostic:', err);
    return NextResponse.json({ error: err.message || 'Error al actualizar diagnóstico' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const campaignId = await getActiveCampaignId();
    if (!campaignId) {
      return NextResponse.json({ error: 'No hay campaña activa.' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de diagnóstico requerido.' }, { status: 400 });
    }

    const existing = await prisma.strategicDiagnostic.findUnique({
      where: { id },
    });

    if (!existing || existing.campaignId !== campaignId) {
      return NextResponse.json({ error: 'Diagnóstico no encontrado en esta campaña.' }, { status: 404 });
    }

    await prisma.strategicDiagnostic.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting diagnostic:', err);
    return NextResponse.json({ error: err.message || 'Error al eliminar diagnóstico' }, { status: 500 });
  }
}
