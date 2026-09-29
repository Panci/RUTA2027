import React from 'react';
import prisma from '@/lib/prisma';
import { getActiveCampaign } from '@/lib/campaign-context';
import { getActiveRole, permissions } from '@/lib/permissions-server';
import CompetidoresClient from './CompetidoresClient';

export const dynamic = 'force-dynamic';

export default async function CompetidoresPage() {
  const activeRole = await getActiveRole();
  const canManage = permissions.canManageCompetitors(activeRole);

  const campaign = await getActiveCampaign({
    include: {
      parties: {
        orderBy: { votes2023: 'desc' },
      },
    },
  });

  if (!campaign) {
    return <div className="p-8 text-center text-slate-500">Campaña no disponible.</div>;
  }

  const competitorLogs = await prisma.competitorTracking.findMany({
    where: {
      party: { campaignId: campaign.id },
    },
    include: {
      party: true,
    },
    orderBy: { date: 'desc' },
  });

  return (
    <CompetidoresClient
      initialLogs={competitorLogs}
      parties={campaign.parties}
      municipality={campaign.municipality}
      readOnly={!canManage}
    />
  );
}
