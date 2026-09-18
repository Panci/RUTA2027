import React from 'react';
import prisma from '@/lib/prisma';
import { Target, Users, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PrioridadesPage() {
  const campaign = await prisma.campaign.findFirst({
    include: {
      strategy: true,
      priorities: {
        include: {
          actionTasks: {
            include: { district: true },
          },
        },
        orderBy: { orderNumber: 'asc' },
      },
    },
  });

  if (!campaign) {
    return <div className="p-8 text-center text-slate-500">Campaña no disponible.</div>;
  }

  const strat = campaign.strategy;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-red-600">
            Enfoque Político Irrenunciable
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Objetivo, Público y Tres Prioridades</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          El núcleo estratégico al que debe alinearse obligatoriamente toda acción, tarea o mensaje de la campaña.
        </p>
      </div>

      {/* Objetivo Político y Público Prioritario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 text-white rounded-xl p-5 shadow-md border border-slate-800 space-y-2">
          <span className="text-xs uppercase font-bold text-red-400 flex items-center gap-1.5">
            <Target className="w-4 h-4" />
            1. Objetivo Político Principal
          </span>
          <h2 className="text-xl font-bold text-white">
            {strat?.mainGoal || campaign.politicalGoal}
          </h2>
          <p className="text-xs text-slate-400">
            Toda decisión organizativa, económica y comunicativa debe evaluarse en función de si acerca o aleja este objetivo.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
          <span className="text-xs uppercase font-bold text-slate-500 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600" />
            2. Público Prioritario (Términos Agregados)
          </span>
          <h2 className="text-base font-bold text-slate-800">
            {strat?.targetAudience || 'Familias jóvenes y trabajadores de los distritos 2, 3 y 4.'}
          </h2>
          <p className="text-xs text-slate-500">
            El segmento sociodemográfico clave para decantar la mayoría en el pleno municipal.
          </p>
        </div>
      </div>

      {/* Las 3 Prioridades Políticas */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Las Tres Prioridades Políticas</h2>
            <p className="text-xs text-slate-500">Ninguna campaña puede prometer 50 cosas; estas son las 3 batallas centrales.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {campaign.priorities.map((p) => {
            const taskCount = p.actionTasks.length;
            return (
              <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow">
                      {p.orderNumber}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {taskCount} acciones vinculadas
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{p.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <span className="font-semibold block text-slate-700">Métrica o compromiso:</span>
                  <p className="text-[11px] text-emerald-700 font-medium mt-0.5">{p.targetMetric || 'Compromiso de programa electoral.'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ideas Fuerza de Identidad y Posicionamiento */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h2 className="font-bold text-slate-800 text-base">Ideas Clave de Identidad de Candidatura</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
            <span className="font-bold text-slate-500 block text-[10px] uppercase">Idea 1</span>
            <p className="font-semibold text-slate-800">{strat?.brandIdea1 || 'Un Valle Real para vivir.'}</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
            <span className="font-bold text-slate-500 block text-[10px] uppercase">Idea 2</span>
            <p className="font-semibold text-slate-800">{strat?.brandIdea2 || 'Alcalde de todos los barrios.'}</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
            <span className="font-bold text-slate-500 block text-[10px] uppercase">Idea 3</span>
            <p className="font-semibold text-slate-800">{strat?.brandIdea3 || 'Gestión rigurosa y cercanía.'}</p>
          </div>
        </div>
      </div>

      {/* Disciplina de Mensaje */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3>Mensajes que Deben Repetirse Sistemáticamente</h3>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed bg-white/70 p-3 rounded-lg border border-emerald-100">
            {strat?.messagesToRepeat || 'Inversión en los 5 distritos; plan de choque de limpieza.'}
          </p>
        </div>

        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h3>Temas que Conviene Evitar</h3>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed bg-white/70 p-3 rounded-lg border border-rose-100">
            {strat?.topicsToAvoid || 'Disputas ideológicas nacionales sin impacto en la política municipal.'}
          </p>
        </div>
      </div>
    </div>
  );
}
