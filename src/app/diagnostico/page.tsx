import React from 'react';
import prisma from '@/lib/prisma';
import { Compass, ShieldCheck, AlertTriangle, Lightbulb, Zap, Users, Wallet, Layers } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DiagnosticoPage() {
  const campaign = await prisma.campaign.findFirst({
    include: {
      diagnostics: {
        include: { district: true },
      },
      districts: true,
    },
  });

  if (!campaign) {
    return <div className="p-8 text-center text-slate-500">Campaña no disponible.</div>;
  }

  const municipalDiagnostic = campaign.diagnostics.find((d) => !d.districtId) || campaign.diagnostics[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-red-600">
            Diagnóstico Integral
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Matriz DAFO Municipal y Territorial</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Diagnóstico de situación política, problemas ciudadanos y capacidades reales del equipo de Valle Real.
        </p>
      </div>

      {/* Situación Política y Problemas Ciudadanos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-red-600" />
            Situación Política del Municipio
          </span>
          <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
            {municipalDiagnostic?.situationOverview || campaign.teamDescription}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Problemas Ciudadanos Centrales
          </span>
          <p className="text-sm text-slate-800 leading-relaxed bg-amber-50/50 p-3.5 rounded-lg border border-amber-200/60">
            {municipalDiagnostic?.citizenProblems || 'Limpieza viaria, vivienda joven y mantenimiento de colegios.'}
          </p>
        </div>
      </div>

      {/* Matriz DAFO de 4 Cuadrantes */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-800">Matriz DAFO Estratégica</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Fortalezas */}
          <div className="bg-emerald-50/70 rounded-xl border border-emerald-200 p-5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm uppercase tracking-wide">Fortalezas de la Candidatura</h3>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
              {municipalDiagnostic?.strengths || campaign.strengths}
            </p>
          </div>

          {/* Debilidades */}
          <div className="bg-rose-50/70 rounded-xl border border-rose-200 p-5 space-y-2">
            <div className="flex items-center gap-2 text-rose-800">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-sm uppercase tracking-wide">Debilidades a Subsanar</h3>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
              {municipalDiagnostic?.weaknesses || campaign.weaknesses}
            </p>
          </div>

          {/* Oportunidades */}
          <div className="bg-blue-50/70 rounded-xl border border-blue-200 p-5 space-y-2">
            <div className="flex items-center gap-2 text-blue-800">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-sm uppercase tracking-wide">Oportunidades del Entorno</h3>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
              {municipalDiagnostic?.opportunities || 'Alta desmovilización en barrios periféricos y desgaste del gobierno.'}
            </p>
          </div>

          {/* Amenazas */}
          <div className="bg-amber-50/70 rounded-xl border border-amber-200 p-5 space-y-2">
            <div className="flex items-center gap-2 text-amber-800">
              <Zap className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-sm uppercase tracking-wide">Amenazas y Riesgos Políticos</h3>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
              {municipalDiagnostic?.threats || campaign.risks}
            </p>
          </div>
        </div>
      </div>

      {/* Capacidades Reales y Recursos Disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600" />
            Capacidades Reales del Equipo
          </span>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            {municipalDiagnostic?.teamCapabilities || 'Comité directivo diario, 85 interventores confirmados y equipo de redes.'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-purple-600" />
            Recursos Disponibles
          </span>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            {municipalDiagnostic?.availableResources || campaign.availableResources}
          </p>
        </div>
      </div>
    </div>
  );
}
