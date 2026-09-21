import React from 'react';
import { getAllCampaigns, getActiveCampaignId } from '@/lib/campaign-context';
import MunicipiosClient from './MunicipiosClient';

export const dynamic = 'force-dynamic';

export default async function MunicipiosPage() {
  const campaigns = await getAllCampaigns();
  const activeId = await getActiveCampaignId();

  return <MunicipiosClient campaigns={campaigns} activeId={activeId} />;
}
