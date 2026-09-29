import React from 'react';
import { getActiveCampaign } from '@/lib/campaign-context';
import AuditoriaClient from './AuditoriaClient';

export const dynamic = 'force-dynamic';

export default async function AuditoriaPage() {
  const campaign = await getActiveCampaign();

  return (
    <AuditoriaClient
      campaignId={campaign?.id || 'default'}
      initialMunicipality={campaign?.municipality || 'Municipio'}
      initialParty={campaign?.candidacyName || campaign?.partyOrCoalition || campaign?.name || 'Candidatura'}
    />
  );
}
