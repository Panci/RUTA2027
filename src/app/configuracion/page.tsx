import React from 'react';
import { getActiveCampaign } from '@/lib/campaign-context';
import ConfiguracionClient from './ConfiguracionClient';

export const dynamic = 'force-dynamic';

export default async function ConfiguracionPage() {
  const campaign = await getActiveCampaign();

  if (!campaign) {
    return <div className="p-8 text-center text-slate-500">Campaña no disponible.</div>;
  }

  const campaignData = {
    municipality: campaign.municipality,
    electionDate: campaign.electionDate.toISOString().split('T')[0],
    candidacyName: campaign.candidacyName,
    partyOrCoalition: campaign.partyOrCoalition,
    politicalGoal: campaign.politicalGoal,
    mainAdversaries: campaign.mainAdversaries,
    teamDescription: campaign.teamDescription,
    availableResources: campaign.availableResources,
    strengths: campaign.strengths,
    risks: campaign.risks,
  };

  return <ConfiguracionClient campaign={campaignData} />;
}
