import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { ACTIVE_CAMPAIGN_COOKIE, getActiveCampaignId } from '@/lib/campaign-context';
import { getActiveRole, permissions } from '@/lib/permissions-server';
import { getSession } from '@/lib/auth';
import { CampaignCreateSchema } from '@/lib/validations';

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
    return NextResponse.json(
      { error: 'Error interno al obtener los municipios.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere iniciar sesión.' },
        { status: 401 }
      );
    }

    const activeRole = await getActiveRole();
    if (!permissions.canManageMunicipalities(activeRole)) {
      return NextResponse.json(
        { error: 'No dispones de permisos para crear municipios con tu rol actual.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parseResult = CampaignCreateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Datos de municipio o campaña no válidos.' },
        { status: 400 }
      );
    }

    const {
      municipality,
      candidacyName,
      partyOrCoalition,
      politicalGoal,
      electionDate,
      teamDescription,
      availableResources,
      mainAdversaries,
      strengths,
      weaknesses,
      risks,
    } = parseResult.data;

    const campaign = await prisma.campaign.create({
      data: {
        name: `Campaña ${municipality} 2027`,
        municipality,
        candidacyName,
        partyOrCoalition,
        politicalGoal,
        electionDate,
        teamDescription: teamDescription || null,
        availableResources: availableResources || null,
        mainAdversaries: mainAdversaries || null,
        strengths: strengths || null,
        weaknesses: weaknesses || null,
        risks: risks || null,
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
        objectives: 'Tres prioridades irrenunciables, banco de mensajes y argumentarios.',
      },
      {
        phaseNumber: 3,
        name: 'Relación y presencia pública',
        startDate: new Date('2027-01-01'),
        endDate: new Date('2027-02-28'),
        status: 'PENDING',
        objectives: 'Reuniones sectoriales, actos en distritos prioritarios y presencia en medios.',
      },
      {
        phaseNumber: 4,
        name: 'Activación del equipo',
        startDate: new Date('2027-03-01'),
        endDate: new Date('2027-03-31'),
        status: 'PENDING',
        objectives: 'Formación de apoderados e interventores, movilización de colaboradores.',
      },
      {
        phaseNumber: 5,
        name: 'Contacto ciudadano',
        startDate: new Date('2027-04-01'),
        endDate: new Date('2027-05-06'),
        status: 'PENDING',
        objectives: 'Buzoneo, carpas informativas y visitas puerta a puerta.',
      },
      {
        phaseNumber: 6,
        name: 'Campaña electoral oficial',
        startDate: new Date('2027-05-07'),
        endDate: new Date('2027-05-21'),
        status: 'PENDING',
        objectives: 'Disciplina de mensaje diario, actos centrales y movilización del voto indeciso.',
      },
      {
        phaseNumber: 7,
        name: 'Tramo final y jornada electoral',
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

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        campaignId: campaign.id,
        userId: session.id,
        userName: session.name,
        action: 'CREATE',
        resource: 'Campaña Municipal',
        details: `Nuevo municipio "${municipality}" creado por ${session.name} con candidatura "${candidacyName}"`,
      },
    });

    // Establecer la nueva campaña como la activa en la cookie
    cookies().set(ACTIVE_CAMPAIGN_COOKIE, campaign.id, {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 365,
    });

    return NextResponse.json({
      success: true,
      campaign,
    });
  } catch (err: any) {
    console.error('Error al crear municipio/campaña:', err);
    return NextResponse.json(
      { error: 'Error interno al crear el municipio o campaña.' },
      { status: 500 }
    );
  }
}
