import React from 'react';
import { getAllCampaigns, getActiveCampaignId } from '@/lib/campaign-context';
import { getActiveRole, permissions } from '@/lib/permissions-server';
import MunicipiosClient from './MunicipiosClient';

export const dynamic = 'force-dynamic';

export default async function MunicipiosPage() {
  const campaigns = await getAllCampaigns();
  const activeId = await getActiveCampaignId();
  const activeRole = await getActiveRole();

  return (
    <MunicipiosClient
      campaigns={campaigns}
      activeId={activeId}
      canManage={permissions.canManageMunicipalities(activeRole)}
    />
  );
}
