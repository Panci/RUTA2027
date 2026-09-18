import React from 'react';
import prisma from '@/lib/prisma';
import { Users, Shield, Award, AlertCircle, Plus, Layers, UserCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PartidosPage() {
  const campaign = await prisma.campaign.findFirst({
    include: {
      parties: {
        include: {
          electionResults: {
            include: { district: true },
          },
          competitorLogs: {
            take: 2,
            orderBy: { date: 'desc' },
          },
        },
        orderBy: { votes2023: 'desc' },
      },
    },
  });

  if (!campaign) {
    return <div className="p-8 text-center text-slate-500">Campaña no disponible.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-red-600">Mapa de Competidores</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Partidos y Candidaturas (2023 - 2027)</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Seguimiento de candidaturas concurrentes, alianzas previstas y diferenciación entre datos e hipótesis.
          </p>
        </div>
      </div>

      {/* Explicación de Categorías Epistemológicas (Sección 4) */}
      <div className="bg-slate-900 text-white rounded-xl p-4 text-xs space-y-2 border border-slate-800">
        <span className="font-bold text-slate-200 block text-xs uppercase tracking-wider">
          Separación Rigurosa de Niveles de Información:
        </span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
            <span className="font-bold text-emerald-400 block">📊 Dato Confirmado</span>
            <span className="text-slate-400 text-[11px]">Escrutinio oficial LOREG 2023 y actas municipales.</span>
          </div>
          <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
            <span className="font-bold text-blue-400 block">📢 Información Pública</span>
            <span className="text-slate-400 text-[11px]">Declaraciones en prensa, listas registradas y actos.</span>
          </div>
          <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
            <span className="font-bold text-amber-400 block">🧠 Valoración del Equipo</span>
            <span className="text-slate-400 text-[11px]">Análisis cualitativo interno de fortalezas y debilidades.</span>
          </div>
          <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
            <span className="font-bold text-purple-400 block">🔮 Hipótesis de Trabajo</span>
            <span className="text-slate-400 text-[11px]">Posibles alianzas, rupturas o cambios de candidato.</span>
          </div>
        </div>
      </div>

      {/* Grid de Candidaturas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaign.parties.map((p) => {
          return (
            <div
              key={p.id}
              className={`bg-white rounded-xl border p-5 shadow-sm space-y-4 ${
                p.isOwnParty ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-white text-sm shadow-sm"
                    style={{ backgroundColor: p.colorHex }}
                  >
                    {p.acronym}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{p.name}</h3>
                      {p.isOwnParty && (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          PROPIA
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      Candidato/a: <strong>{p.candidateName || 'Por definir o confirmar públicamente'}</strong>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-slate-800">{p.concejales2023}</span>
                  <span className="text-[11px] text-slate-500 block leading-none">concejales 2023</span>
                </div>
              </div>

              {/* 1. Datos Confirmados */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-1 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-emerald-800 flex items-center gap-1">
                    📊 Dato Electoral 2023
                  </span>
                  <span className="text-slate-500 font-semibold">{p.votes2023.toLocaleString()} votos ({p.percent2023}%)</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.min(100, p.percent2023 * 2)}%`, backgroundColor: p.colorHex }}
                  ></div>
                </div>
              </div>

              {/* 2. Temas Principales y Mensajes (Información Pública) */}
              <div className="text-xs space-y-1">
                <span className="font-bold text-blue-700 flex items-center gap-1 text-[11px]">
                  📢 Temas y Mensajes Públicos:
                </span>
                <p className="text-slate-700 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                  {p.mainTopics || 'Sin declaraciones o temas registrados.'}
                </p>
              </div>

              {/* 3. Fortalezas y Debilidades (Valoración del Equipo) */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-700 block text-[11px]">💪 Fortalezas:</span>
                  <p className="text-slate-600 text-[11px]">{p.strengths || 'Pendiente de diagnóstico.'}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-700 block text-[11px]">⚠️ Debilidades:</span>
                  <p className="text-slate-600 text-[11px]">{p.weaknesses || 'Pendiente de diagnóstico.'}</p>
                </div>
              </div>

              {/* 4. Posibles Alianzas e Hipótesis (Hipótesis de Trabajo) */}
              <div className="text-xs space-y-1">
                <span className="font-bold text-purple-700 flex items-center gap-1 text-[11px]">
                  🔮 Hipótesis de Pactos / Escenarios 2027:
                </span>
                <p className="text-slate-600 italic bg-purple-50/50 p-2 rounded border border-purple-100 text-[11px]">
                  {p.potentialAlliances || 'Sin hipótesis de alianzas registradas.'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
