import React from 'react';
import { getActiveCampaign } from '@/lib/campaign-context';
import DiagnosticoClient from './DiagnosticoClient';

export const dynamic = 'force-dynamic';

export default async function DiagnosticoPage() {
  const campaign = await getActiveCampaign({
    include: {
      diagnostics: {
        include: { district: true },
        orderBy: { createdAt: 'asc' },
      },
      districts: {
        orderBy: { code: 'asc' },
      },
    },
  });

  if (!campaign) {
    return <div className="p-8 text-center text-slate-500">Campaña no disponible.</div>;
  }

  return (
    <DiagnosticoClient
      initialDiagnostics={campaign.diagnostics}
      districts={campaign.districts}
      municipalityName={campaign.municipality}
      campaignDescription={campaign.teamDescription || ''}
    />
  );
}
