import React from 'react';
import prisma from '@/lib/prisma';
import { getActiveCampaign } from '@/lib/campaign-context';
import { getActiveRole, permissions } from '@/lib/permissions-server';
import MensajesClient from './MensajesClient';

export const dynamic = 'force-dynamic';

export default async function MensajesPage() {
  const activeRole = await getActiveRole();
  const canManage = permissions.canManageMessages(activeRole);

  const campaign = await getActiveCampaign({
    include: {
      districts: {
        orderBy: { name: 'asc' },
      },
      messageBank: {
        include: { district: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!campaign) {
    return <div className="p-8 text-center text-slate-500">Campaña no disponible.</div>;
  }

  return (
    <MensajesClient
      initialMessages={campaign.messageBank}
      districts={campaign.districts}
      municipality={campaign.municipality}
      readOnly={!canManage}
    />
  );
}
