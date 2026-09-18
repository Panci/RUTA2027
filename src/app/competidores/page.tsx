import React from 'react';
import prisma from '@/lib/prisma';
import { Eye, AlertCircle, TrendingUp, Sparkles, UserCheck, ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CompetidoresPage() {
  const competitorLogs = await prisma.competitorTracking.findMany({
    include: {
      party: true,
    },
    orderBy: { date: 'desc' },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-red-600">
            Inteligencia Política
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Radar y Seguimiento de Competidores</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Monitorización de declaraciones, movimientos, errores públicos y ventanas de oportunidad en Valle Real.
        </p>
      </div>

      <div className="space-y-4">
        {competitorLogs.map((log) => (
          <div key={log.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded text-xs font-black text-white"
                  style={{ backgroundColor: log.party.colorHex }}
                >
                  {log.party.acronym}
                </span>
                <span className="text-xs font-semibold text-slate-700">{log.party.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 font-bold uppercase text-slate-600">
                  {log.type}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {new Date(log.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <h3 className="font-bold text-slate-900 text-base">{log.title}</h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/80">
              {log.description}
            </p>

            {log.opportunityToDifferentiate && (
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs space-y-1">
                <span className="font-bold text-emerald-800 flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Oportunidad de Diferenciación para Nuestra Candidatura:
                </span>
                <p className="text-slate-800 font-medium">{log.opportunityToDifferentiate}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
