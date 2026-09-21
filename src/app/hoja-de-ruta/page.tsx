import React from 'react';
import prisma from '@/lib/prisma';
import { getActiveCampaign } from '@/lib/campaign-context';
import { getActiveRole, permissions } from '@/lib/permissions-server';
import MilestoneToggle from './MilestoneToggle';
import { Milestone, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HojaDeRutaPage() {
  const activeRole = await getActiveRole();
  const canChangeStatus = permissions.canChangeTaskStatus(activeRole);

  const campaign = await getActiveCampaign({
    include: {
      phases: {
        include: {
          milestones: {
            include: { responsible: true },
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
          Evolución secuencial de la campaña en 7 fases hacia las elecciones de mayo de 2027. Haz clic en un hito para marcarlo como completado.
        </p>
      </div>

      {/* Timeline de las 7 Fases */}
      <div className="space-y-4">
        {campaign.phases.map((phase) => {
          const isCurrent = phase.status === 'IN_PROGRESS';
          const isCompleted = phase.status === 'COMPLETED';

          return (
            <div
              key={phase.id}
              className={`bg-white rounded-xl border p-5 shadow-sm transition ${
                isCurrent
                  ? 'border-red-500 ring-2 ring-red-500/10'
                  : isCompleted
                  ? 'border-emerald-300'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center ${
                      isCurrent
                        ? 'bg-red-600 text-white shadow'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {phase.phaseNumber}
                  </span>
                  <div>
                    <h2 className="font-bold text-slate-900 text-base">{phase.name}</h2>
                    <span className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(phase.startDate).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })} —{' '}
                      {new Date(phase.endDate).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                    isCurrent
                      ? 'bg-red-100 text-red-700'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isCurrent ? 'Fase Activa' : isCompleted ? 'Completada' : 'Planificada'}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-500 block mb-1">Objetivo Central de Fase:</span>
                  <p className="text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-200/80">
                    {phase.objectives || 'Sin objetivos especificados.'}
                  </p>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <span className="font-semibold text-slate-500 block">Hitos Clave (haz clic para marcar cumplimiento):</span>
                  {phase.milestones.length === 0 ? (
                    <p className="text-slate-400 italic">No hay hitos programados en esta fase todavía.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {phase.milestones.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200/80"
                        >
                          <MilestoneToggle
                            milestoneId={m.id}
                            initialCompleted={m.isCompleted}
                            title={m.title}
                            readOnly={!canChangeStatus}
                          />
                          <span className="text-[11px] text-slate-500 font-medium shrink-0 ml-2">
                            {new Date(m.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
