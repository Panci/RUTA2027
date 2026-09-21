import React from 'react';
import prisma from '@/lib/prisma';
import { getActiveCampaign } from '@/lib/campaign-context';
import { BarChart3, CheckCircle2, Clock, MapPin, Target, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function IndicadoresPage() {
  const campaign = await getActiveCampaign({
    include: {
      actionTasks: true,
      districts: {
        include: {
          actionTasks: true,
        },
      },
      priorities: {
        include: {
          actionTasks: true,
        },
      },
      phases: {
        include: {
          milestones: true,
        },
      },
    },
  });

  if (!campaign) {
    return <div className="p-8 text-center text-slate-500">Campaña no disponible.</div>;
  }

  const totalTasks = campaign.actionTasks.length;
  const completedTasks = campaign.actionTasks.filter((t) => t.status === 'COMPLETED').length;
  const inProgressTasks = campaign.actionTasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const totalMilestones = campaign.phases.flatMap((p) => p.milestones).length;
  const completedMilestones = campaign.phases.flatMap((p) => p.milestones).filter((m) => m.isCompleted).length;
  const milestoneRate = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-red-600">
            Métricas de Gestión
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Cuadro de Mando e Indicadores Internos</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Monitoreo de ejecución operativa, penetración territorial y avance de objetivos estratégicos.
        </p>
      </div>

      {/* Tarjetas de KPIs Operativos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
          <span className="text-xs text-slate-500 font-semibold uppercase">Cumplimiento de Tareas</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{completionRate.toFixed(0)}%</span>
            <span className="text-xs text-slate-400">({completedTasks}/{totalTasks} tareas)</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${completionRate}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
          <span className="text-xs text-slate-500 font-semibold uppercase">Cumplimiento de Hitos</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{milestoneRate.toFixed(0)}%</span>
            <span className="text-xs text-slate-400">({completedMilestones}/{totalMilestones} hitos)</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${milestoneRate}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
          <span className="text-xs text-slate-500 font-semibold uppercase">Actividad en Curso</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">{inProgressTasks}</span>
            <span className="text-xs text-slate-400">acciones en marcha</span>
          </div>
          <p className="text-[11px] text-slate-500">Distribuidas en 5 distritos.</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
          <span className="text-xs text-slate-500 font-semibold uppercase">Prioridades Cubiertas</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">3 / 3</span>
            <span className="text-xs text-slate-400">prioridades activas</span>
          </div>
          <p className="text-[11px] text-slate-500">Alineación estratégica total.</p>
        </div>
      </div>

      {/* Penetración Territorial y Actividad por Distrito */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-600" />
            <h2 className="font-bold text-slate-800 text-base">Penetración y Actividad por Distrito</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Equilibrio territorial de campaña</span>
        </div>

        <div className="space-y-3">
          {campaign.districts.map((d) => {
            const count = d.actionTasks.length;
            const pct = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
            return (
              <div key={d.id} className="space-y-1 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-800">{d.name} ({d.classification})</span>
                  <span className="text-slate-600">{count} acciones ({pct.toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-800 rounded-full" style={{ width: `${Math.max(5, pct)}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
