import React from 'react';
import { CalendarDays, AlertCircle } from 'lucide-react';
import { getAllCampaigns, getActiveCampaign } from '@/lib/campaign-context';
import { getActiveRole, permissions } from '@/lib/permissions-server';
import MunicipalitySelector from './MunicipalitySelector';

export default async function Navbar() {
  const campaigns = await getAllCampaigns();
  const activeRole = await getActiveRole();
  const canSwitch = permissions.canSwitchAllMunicipalities(activeRole);

  const activeCampaign = await getActiveCampaign({
    include: {
      phases: {
        where: { status: 'IN_PROGRESS' },
        take: 1,
      },
    },
  });

  const activePhase = activeCampaign?.phases?.[0];

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs print:hidden">
      {/* Campaign & Context Selector */}
      <div className="flex items-center gap-3">
        <MunicipalitySelector
          initialActiveId={activeCampaign?.id || null}
          canSwitch={canSwitch}
          initialCampaigns={campaigns.map((c) => ({
            id: c.id,
            name: c.name,
            municipality: c.municipality,
            candidacyName: c.candidacyName,
            partyOrCoalition: c.partyOrCoalition,
          }))}
        />

        <span className="text-slate-200 hidden sm:inline">|</span>

        <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{activePhase ? `Fase ${activePhase.phaseNumber}: ${activePhase.name}` : 'Campaña Activa 2027'}</span>
        </div>
      </div>

      {/* Countdown & Quick Actions */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md border border-slate-200 font-medium">
          <CalendarDays className="w-4 h-4 text-slate-500" />
          <span>Elecciones: <strong>23 Mayo 2027</strong></span>
        </div>
        <div className="hidden lg:flex items-center gap-1.5 text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>Comité Semanal: Miércoles 18:00h</span>
        </div>
      </div>
    </header>
  );
}
