import React from 'react';
import prisma from '@/lib/prisma';
import SimulationClient from './SimulationClient';

export const dynamic = 'force-dynamic';

export default async function SimulacionPage() {
  const campaign = await prisma.campaign.findFirst({
    include: {
      parties: true,
    },
  });

  if (!campaign) {
    return <div className="p-8 text-center text-slate-500">Campaña no disponible.</div>;
  }

  const initialParties = campaign.parties.map((p) => ({
    id: p.id,
    name: p.name,
    acronym: p.acronym,
    colorHex: p.colorHex,
    isOwnParty: p.isOwnParty,
    baseVotes: p.votes2023,
  }));

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-red-600">
            Escenarios Hipotéticos
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Simulador Electoral y Reparto D'Hondt</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Modelado aritmético de reparto de concejales con barrera electoral legal (5%) en Valle Real.
        </p>
      </div>

      <SimulationClient initialParties={initialParties} />
    </div>
  );
}
