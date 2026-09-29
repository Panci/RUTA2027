import React from 'react';
import prisma from '@/lib/prisma';
import { getActiveCampaign } from '@/lib/campaign-context';
import { getActiveRole, permissions } from '@/lib/permissions-server';
import SimulationClient from './SimulationClient';

export const dynamic = 'force-dynamic';

export default async function SimulacionPage() {
  const activeRole = await getActiveRole();
  const canEdit = permissions.canEditSimulation(activeRole);

  const campaign = await getActiveCampaign({
    include: {
      parties: true,
      districts: {
        include: {
          electionResults: true,
        },
      },
    },
  });

  if (!campaign) {
    return <div className="p-8 text-center text-slate-500">Campaña no disponible.</div>;
  }

  // Número oficial de concejales del pleno según el escrutinio de este municipio
  const municipalSeats =
    campaign.parties.reduce((sum, p) => sum + (p.concejales2023 || 0), 0) || 9;

  // Votos en blanco oficiales del municipio
  const blankVotesOfficial =
    campaign.districts.reduce((sum, d) => {
      const res = d.electionResults[0];
      return sum + (res?.blankVotes || 0);
    }, 0) || Math.max(5, Math.round(campaign.parties.reduce((s, p) => s + p.votes2023, 0) * 0.01));

  // Censo total oficial del municipio
  const municipalCensus =
    campaign.districts.reduce((sum, d) => sum + (d.electoralRoll || 0), 0) || 1200;

  // Votos nulos oficiales del municipio
  const nullVotesOfficial =
    campaign.districts.reduce((sum, d) => {
      const res = d.electionResults[0];
      return sum + (res?.nullVotes || 0);
    }, 0) || 15;

  const initialParties = campaign.parties.map((p) => ({
    id: p.id,
    name: p.name,
    acronym: p.acronym,
    colorHex: p.colorHex,
    isOwnParty: p.isOwnParty,
    baseVotes: p.votes2023,
    baseSeats: p.concejales2023,
  }));

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-rose-500">
            Escenarios Hipotéticos
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Simulador Electoral y Reparto D'Hondt</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Modelado aritmético de reparto de concejales en {campaign.municipality} (Pleno municipal: {municipalSeats} concejales · Censo: {municipalCensus.toLocaleString()} electores).
        </p>
      </div>

      <SimulationClient
        initialParties={initialParties}
        defaultSeats={municipalSeats}
        defaultCensus={municipalCensus}
        defaultBlankVotes={blankVotesOfficial}
        defaultNullVotes={nullVotesOfficial}
        municipalityName={campaign.municipality}
        readOnly={!canEdit}
      />
    </div>
  );
}
