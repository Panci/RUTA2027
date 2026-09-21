import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { ACTIVE_CAMPAIGN_COOKIE, getActiveCampaignId } from '@/lib/campaign-context';
import { getActiveRole, permissions } from '@/lib/permissions-server';

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { municipality: 'asc' },
      select: {
        id: true,
        name: true,
        municipality: true,
        candidacyName: true,
        partyOrCoalition: true,
        politicalGoal: true,
        electionDate: true,
        createdAt: true,
        _count: {
          select: {
            districts: true,
            actionTasks: true,
            parties: true,
          },
        },
      },
    });

    const activeId = await getActiveCampaignId();

    return NextResponse.json({
      activeId,
      campaigns,
    });
  } catch (err: any) {
    console.error('Error al obtener municipios/campañas:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const activeRole = await getActiveRole();
    if (!permissions.canManageMunicipalities(activeRole)) {
      return NextResponse.json(
        { error: 'No dispones de permisos para crear municipios con tu rol actual.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      municipality,
      candidacyName,
      partyOrCoalition,
      politicalGoal,
      electionDate,
      teamDescription,
      availableResources,
      mainAdversaries,
    } = body;

    if (!municipality || !candidacyName || !partyOrCoalition) {
      return NextResponse.json(
        { error: 'Los campos Municipio, Candidatura y Partido son obligatorios.' },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.create({
      data: {
        name: name || `Campaña ${municipality} 2027`,
        municipality,
        candidacyName,
        partyOrCoalition,
        politicalGoal: politicalGoal || 'GANAR',
        electionDate: electionDate ? new Date(electionDate) : new Date('2027-05-23T00:00:00.000Z'),
        teamDescription: teamDescription || null,
        availableResources: availableResources || null,
        mainAdversaries: mainAdversaries || null,
      },
    });

    // Crear automáticamente las 7 fases estándar de Hoja de Ruta 2026-2027
    const standardPhases = [
      {
        phaseNumber: 1,
        name: 'Diagnóstico y preparación',
        startDate: new Date('2026-09-01'),
        endDate: new Date('2026-10-31'),
        status: 'IN_PROGRESS',
        objectives: 'Censo de voluntariado, diagnóstico territorial por distrito y presupuesto.',
      },
      {
        phaseNumber: 2,
        name: 'Definición del posicionamiento',
        startDate: new Date('2026-11-01'),
        endDate: new Date('2026-12-31'),
        status: 'PENDING',
        objectives: 'Fijación de las 3 prioridades políticas y proclamación de candidatura.',
      },
      {
        phaseNumber: 3,
        name: 'Construcción de relación y presencia pública',
        startDate: new Date('2027-01-01'),
        endDate: new Date('2027-02-28'),
        status: 'PENDING',
        objectives: 'Ronda de reuniones sectoriales con comerciantes y colectivos vecinales.',
      },
      {
        phaseNumber: 4,
        name: 'Activación del equipo y precampaña',
        startDate: new Date('2027-03-01'),
        endDate: new Date('2027-03-31'),
        status: 'PENDING',
        objectives: 'Despliegue de carpas en distritos y captación de apoderados.',
      },
      {
        phaseNumber: 5,
        name: 'Presentación del programa y candidatura',
        startDate: new Date('2027-04-01'),
        endDate: new Date('2027-04-30'),
        status: 'PENDING',
        objectives: 'Acto central de presentación de lista electoral y compromisos irrenunciables.',
      },
      {
        phaseNumber: 6,
        name: 'Campaña oficial',
        startDate: new Date('2027-05-01'),
        endDate: new Date('2027-05-21'),
        status: 'PENDING',
        objectives: 'Movilización masiva de calle, puerta a puerta y actos finales.',
      },
      {
        phaseNumber: 7,
        name: 'Día de elecciones y balance',
        startDate: new Date('2027-05-22'),
        endDate: new Date('2027-05-31'),
        status: 'PENDING',
        objectives: 'Cobertura de mesas electorales y análisis de resultados.',
      },
    ];

    for (const phase of standardPhases) {
      await prisma.roadmapPhase.create({
        data: {
          campaignId: campaign.id,
          ...phase,
        },
      });
    }

    // Establecer la nueva campaña como la activa en la cookie
    cookies().set(ACTIVE_CAMPAIGN_COOKIE, campaign.id, {
      path: '/',
      httpOnly: false, // Accesible por cliente si es necesario
      maxAge: 60 * 60 * 24 * 365, // 1 año
    });

    return NextResponse.json({
      success: true,
      campaign,
    });
  } catch (err: any) {
    console.error('Error al crear municipio/campaña:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
