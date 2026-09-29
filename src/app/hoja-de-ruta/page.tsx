import React from 'react';
import { getActiveCampaign } from '@/lib/campaign-context';
import { getActiveRole, permissions } from '@/lib/permissions-server';
import HojaDeRutaClient from './HojaDeRutaClient';

export const dynamic = 'force-dynamic';

export default async function HojaDeRutaPage() {
  const activeRole = await getActiveRole();
  const canManage = permissions.canManageRoadmap(activeRole);

  const campaign = await getActiveCampaign({
    include: {
      phases: {
        include: {
          milestones: {
            orderBy: { dueDate: 'asc' },
          },
        },
        orderBy: { phaseNumber: 'asc' },
      },
    },
  });

  if (!campaign) {
    return <div className="p-8 text-center text-slate-500">Campaña no disponible.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-red-600">
            Cronograma Estratégico
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Hoja de Ruta (Septiembre 2026 – Mayo 2027)</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Evolución secuencial de la campaña en 7 fases hacia las elecciones de mayo de 2027 en {campaign.municipality}.
        </p>
      </div>

      <HojaDeRutaClient
        phases={campaign.phases}
        canManage={canManage}
      />
    </div>
  );
}
