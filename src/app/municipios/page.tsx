import React from 'react';
import prisma from '@/lib/prisma';
import { getActiveCampaignId } from '@/lib/campaign-context';
import { getActiveRole, permissions } from '@/lib/permissions-server';
import MunicipiosClient from './MunicipiosClient';

export const dynamic = 'force-dynamic';

export default async function MunicipiosPage() {
  const activeId = await getActiveCampaignId();
  const activeRole = await getActiveRole();

  const isSuperAdmin = permissions.canSwitchAllMunicipalities(activeRole);

  const whereClause = isSuperAdmin
    ? {}
    : { id: activeId || undefined };

  const campaigns = await prisma.campaign.findMany({
    where: whereClause,
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
      users: {
        where: { role: 'CAMPAIGN_DIRECTOR' },
        select: { id: true, name: true, email: true },
      },
    },
  });

  return (
    <MunicipiosClient
      campaigns={campaigns as any}
      activeId={activeId}
      canManage={permissions.canManageMunicipalities(activeRole)}
      isSuperAdmin={isSuperAdmin}
      activeRole={activeRole}
    />
  );
}
