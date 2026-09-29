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

    const parties = await prisma.party.findMany({
      where: { campaignId },
      orderBy: { votes2023: 'desc' },
    });

    return NextResponse.json(parties);
  } catch (err: any) {
    console.error('Error fetching parties:', err);
    return NextResponse.json({ error: err.message || 'Error del servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const activeRole = await getActiveRole();
    if (!permissions.canManageParties(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol actual no tiene permisos para crear partidos o candidaturas.' },
        { status: 403 }
      );
    }

    const campaignId = await getActiveCampaignId();
    if (!campaignId) {
      return NextResponse.json({ error: 'No hay campaña activa.' }, { status: 400 });
    }

    const body = await req.json();
    const {
      name,
      acronym,
      colorHex,
      isOwnParty,
      candidateName,
      concejales2023,
      votes2023,
      percent2023,
      mainTopics,
      strengths,
      weaknesses,
      potentialAlliances,
    } = body;

    if (!name?.trim() || !acronym?.trim()) {
      return NextResponse.json(
        { error: 'El nombre y las siglas de la candidatura son obligatorios.' },
        { status: 400 }
      );
    }

    // Check unique acronym in campaign
    const existing = await prisma.party.findUnique({
      where: {
        campaignId_acronym: {
          campaignId,
          acronym: acronym.trim().toUpperCase(),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Ya existe una candidatura con las siglas "${acronym}" en este municipio.` },
        { status: 400 }
      );
    }

    const created = await prisma.party.create({
      data: {
        campaignId,
        name: name.trim(),
        acronym: acronym.trim().toUpperCase(),
        colorHex: colorHex || '#64748b',
        isOwnParty: Boolean(isOwnParty),
        candidateName: candidateName?.trim() || null,
        concejales2023: Number(concejales2023) || 0,
        votes2023: Number(votes2023) || 0,
        percent2023: Number(percent2023) || 0.0,
        mainTopics: mainTopics?.trim() || null,
        strengths: strengths?.trim() || null,
        weaknesses: weaknesses?.trim() || null,
        potentialAlliances: potentialAlliances?.trim() || null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error('Error creating party:', err);
    return NextResponse.json({ error: err.message || 'Error al crear candidatura' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const campaignId = await getActiveCampaignId();
    if (!campaignId) {
      return NextResponse.json({ error: 'No hay campaña activa.' }, { status: 400 });
    }

    const body = await req.json();
    const {
      id,
      name,
      acronym,
      colorHex,
      isOwnParty,
      candidateName,
      concejales2023,
      votes2023,
      percent2023,
      mainTopics,
      strengths,
      weaknesses,
      potentialAlliances,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de candidatura requerido.' }, { status: 400 });
    }

    const activeRole = await getActiveRole();
    if (!permissions.canManageParties(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol actual no tiene permisos para actualizar candidaturas o partidos.' },
        { status: 403 }
      );
    }

    const existing = await prisma.party.findUnique({
      where: { id },
    });

    if (!existing || existing.campaignId !== campaignId) {
      return NextResponse.json(
        { error: 'Candidatura no encontrada en la campaña activa.' },
        { status: 404 }
      );
    }

    const updated = await prisma.party.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        acronym: acronym !== undefined ? acronym.trim().toUpperCase() : existing.acronym,
        colorHex: colorHex ?? existing.colorHex,
        isOwnParty: isOwnParty !== undefined ? Boolean(isOwnParty) : existing.isOwnParty,
        candidateName: candidateName !== undefined ? (candidateName.trim() || null) : existing.candidateName,
        concejales2023: concejales2023 !== undefined ? Number(concejales2023) : existing.concejales2023,
        votes2023: votes2023 !== undefined ? Number(votes2023) : existing.votes2023,
        percent2023: percent2023 !== undefined ? Number(percent2023) : existing.percent2023,
        mainTopics: mainTopics !== undefined ? (mainTopics.trim() || null) : existing.mainTopics,
        strengths: strengths !== undefined ? (strengths.trim() || null) : existing.strengths,
        weaknesses: weaknesses !== undefined ? (weaknesses.trim() || null) : existing.weaknesses,
        potentialAlliances: potentialAlliances !== undefined ? (potentialAlliances.trim() || null) : existing.potentialAlliances,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('Error updating party:', err);
    return NextResponse.json({ error: err.message || 'Error al actualizar candidatura' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const activeRole = await getActiveRole();
    if (!permissions.canManageParties(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol actual no tiene permisos para eliminar candidaturas o partidos.' },
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

    const existing = await prisma.party.findUnique({
      where: { id },
    });

    if (!existing || existing.campaignId !== campaignId) {
      return NextResponse.json(
        { error: 'Candidatura no encontrada en la campaña activa.' },
        { status: 404 }
      );
    }

    if (existing.isOwnParty) {
      return NextResponse.json(
        { error: 'No es posible eliminar la candidatura propia de la campaña activa.' },
        { status: 400 }
      );
    }

    await prisma.party.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting party:', err);
    return NextResponse.json({ error: err.message || 'Error al eliminar candidatura' }, { status: 500 });
  }
}
