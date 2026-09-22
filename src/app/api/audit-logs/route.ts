import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { getActiveCampaignId } from '@/lib/campaign-context';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const allowedRoles = ['ADMIN', 'CAMPAIGN_DIRECTOR', 'GLOBAL_SUPERVISOR'];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json(
        { error: 'Acceso restringido: no tienes permisos para consultar la auditoría.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const actionFilter = searchParams.get('action');
    const query = searchParams.get('q');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 300);

    const activeCampaignId = await getActiveCampaignId();

    const whereClause: any = {};

    // Si es supervisor global o admin puede ver de la campaña activa o de todas
    if (activeCampaignId && session.role !== 'ADMIN') {
      whereClause.OR = [
        { campaignId: activeCampaignId },
        { campaignId: null }
      ];
    }

    if (actionFilter && actionFilter !== 'ALL') {
      whereClause.action = { startsWith: actionFilter };
    }

    if (query && query.trim()) {
      const q = query.trim();
      whereClause.AND = [
        ...(whereClause.AND || []),
        {
          OR: [
            { userName: { contains: q } },
            { resource: { contains: q } },
            { details: { contains: q } },
          ],
        },
      ];
    }

    const logs = await prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        campaign: {
          select: { municipality: true, candidacyName: true },
        },
      },
    });

    const totalCount = await prisma.auditLog.count({ where: whereClause });

    return NextResponse.json({
      logs,
      totalCount,
      limit,
    });
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Error al recuperar los registros de auditoría.' },
      { status: 500 }
    );
  }
}
