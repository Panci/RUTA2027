import React from 'react';
import prisma from '@/lib/prisma';
import { getActiveCampaign } from '@/lib/campaign-context';
import ImporterClient from './ImporterClient';
import { FileSpreadsheet, AlertCircle, BarChart3, TrendingUp, Info } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Resultados2023Page() {
  const campaign = await getActiveCampaign({
    include: {
      districts: {
        include: {
          electionResults: {
            include: { party: true },
            orderBy: { votes: 'desc' },
          },
        },
      },
      parties: {
        orderBy: { votes2023: 'desc' },
      },
    },
  });

  if (!campaign) {
    return <div className="p-8 text-center text-slate-500">Campaña no disponible.</div>;
  }

  // Agregación de votos municipales totales
  const partyTotals = new Map<string, { party: any; totalVotes: number }>();
  let grandTotalVotes = 0;

  campaign.parties.forEach((p) => {
    partyTotals.set(p.id, { party: p, totalVotes: 0 });
  });

  campaign.districts.forEach((d) => {
    d.electionResults.forEach((res) => {
      grandTotalVotes += res.votes;
      const current = partyTotals.get(res.partyId);
      if (current) {
        current.totalVotes += res.votes;
      }
    });
  });

  const municipalRanking = Array.from(partyTotals.values()).sort((a, b) => b.totalVotes - a.totalVotes);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-red-600">Línea Base Histórica</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Resultados Electorales Municipales 2023</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Punto de partida electoral y diagnóstico territorial de {campaign.municipality}.
        </p>
      </div>

      {/* Nota Metodológica Obligatoria (Sección 3) */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block mb-0.5">Criterio Metodológico Esencial:</strong>
          Los resultados electorales de 2023 se utilizan exclusivamente como <em>línea base analítica</em> para entender las fortalezas y debilidades territoriales, nunca como predicción automática ni garantía para mayo de 2027.
        </div>
      </div>

      {/* Componente de Importación CSV / Excel */}
      <ImporterClient />

      {/* Resumen Municipal Consolidado */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-slate-700" />
            <h2 className="font-bold text-slate-800 text-base">Escrutinio Municipal Consolidado 2023</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Total votos contabilizados: <strong>{grandTotalVotes.toLocaleString()}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {municipalRanking.map(({ party, totalVotes }) => {
            const percent = grandTotalVotes > 0 ? (totalVotes / grandTotalVotes) * 100 : 0;
            return (
              <div key={party.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white px-2 py-0.5 rounded text-[11px]" style={{ backgroundColor: party.colorHex }}>
                    {party.acronym}
                  </span>
                  {party.isOwnParty && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      NUESTRA CANDIDATURA
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-lg font-bold text-slate-800">{totalVotes.toLocaleString()}</span>
                  <span className="text-slate-500 ml-1">votos ({percent.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: party.colorHex }}></div>
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between pt-1">
                  <span>Concejales 2023:</span>
                  <strong className="text-slate-800">{party.concejales2023}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desglose Detallado por Cada Distrito */}
      <div className="space-y-4">
        <h2 className="font-bold text-slate-800 text-lg">Resultados Detallados por Distrito Electoral</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campaign.districts.map((d) => {
            const districtTotalVotes = d.electionResults.reduce((sum, r) => sum + r.votes, 0);
            const winner = d.electionResults[0];

            return (
              <div key={d.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{d.name}</h3>
                    <p className="text-xs text-slate-500">
                      Censo: {d.electoralRoll.toLocaleString()} | Mesas: {d.pollingStationsCount}
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {d.classification.replace('_', ' ')}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-slate-500 border-b border-slate-200 font-semibold">
                      <tr>
                        <th className="pb-2">Candidatura</th>
                        <th className="pb-2 text-right">Votos</th>
                        <th className="pb-2 text-right">% Distrito</th>
                        <th className="pb-2 pl-3">Distribución</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {d.electionResults.map((res) => {
                        const pct = districtTotalVotes > 0 ? (res.votes / districtTotalVotes) * 100 : 0;
                        return (
                          <tr key={res.id} className="hover:bg-slate-50">
                            <td className="py-2 font-medium flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: res.party.colorHex }}></span>
                              <span className={res.party.isOwnParty ? 'font-bold text-emerald-700' : 'text-slate-800'}>
                                {res.party.acronym}
                              </span>
                            </td>
                            <td className="py-2 text-right font-semibold text-slate-700">{res.votes.toLocaleString()}</td>
                            <td className="py-2 text-right font-medium text-slate-600">{pct.toFixed(1)}%</td>
                            <td className="py-2 pl-3 w-28">
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: res.party.colorHex }}></div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {winner && (
                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex justify-between items-center">
                    <span>Fuerza más votada en distrito:</span>
                    <strong className="text-slate-800">{winner.party.name} ({winner.votes.toLocaleString()} votos)</strong>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
