import React from 'react';
import prisma from '@/lib/prisma';
import { getActiveCampaign, getAllCampaigns } from '@/lib/campaign-context';
import { getActiveRole, permissions } from '@/lib/permissions-server';
import EquipoClient from './EquipoClient';

export const dynamic = 'force-dynamic';

export default async function EquipoPage() {
  const activeRole = await getActiveRole();
  const canManage = permissions.canManageTeam(activeRole);

  if (!canManage) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">Acceso Restringido</h2>
        <p className="text-slate-500 mt-2 text-sm">
          Tu rol actual no tiene permisos para gestionar el equipo o dar de alta usuarios.
        </p>
      </div>
    );
  }

  const campaign = await getActiveCampaign({
    include: {
      districts: {
        orderBy: { code: 'asc' },
      },
    },
  });

  const allCampaigns = await getAllCampaigns();

  const whereClause = activeRole === 'ADMIN'
    ? {}
    : { campaignId: campaign?.id };

  const users = await prisma.user.findMany({
    where: whereClause,
    include: {
      campaign: {
        select: { id: true, municipality: true, candidacyName: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <EquipoClient
      initialUsers={users as any}
      activeCampaign={campaign}
      allCampaigns={allCampaigns}
      activeRole={activeRole}
      isAdmin={activeRole === 'ADMIN'}
    />
  );
}
