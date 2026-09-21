import React from 'react';
import prisma from '@/lib/prisma';
import { getActiveCampaign } from '@/lib/campaign-context';
import { getActiveRole, permissions } from '@/lib/permissions-server';
import ClassificationEditor from './ClassificationEditor';
import DistrictCharts from './DistrictCharts';
import { MapPin, TrendingUp, ShieldAlert, Award, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DistritosPage() {
  const activeRole = await getActiveRole();
  const canClassify = permissions.canClassifyDistricts(activeRole);

  const campaign = await getActiveCampaign({
    include: {
      parties: true,
      districts: {
        include: {
          electionResults: {
            include: { party: true },
            orderBy: { votes: 'desc' },
          },
        },
      },
    },
  });

  if (!campaign) {
    return <div className="p-8 text-center text-slate-500">Campaña no disponible.</div>;
  }

  const ownParty = campaign.parties.find((p) => p.isOwnParty) || campaign.parties[0];

  // Cálculo de media municipal de nuestro partido
  let totalOwnVotes = 0;
  let totalValidMunicipalVotes = 0;

  campaign.districts.forEach((d) => {
    d.electionResults.forEach((r) => {
      totalValidMunicipalVotes += r.votes;
      if (r.partyId === ownParty.id) {
        totalOwnVotes += r.votes;
      }
    });
  });

  const municipalAvgPercent = totalValidMunicipalVotes > 0 ? (totalOwnVotes / totalValidMunicipalVotes) * 100 : 0;

  // Datos para el gráfico de barras por distrito
  const chartData = campaign.districts.map((d) => {
    const getVotes = (acronym: string) => {
      const res = d.electionResults.find((r) => r.party.acronym === acronym);
      return res ? res.votes : 0;
    };

    return {
      distrito: d.code,
      AVANZA: getVotes('AVANZA'),
      PP: getVotes('PP'),
      PSOE: getVotes('PSOE'),
      VOX: getVotes('VOX'),
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-red-600">Estrategia Territorial</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Análisis y Comparativa por Distritos</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Diagnóstico electoral distrito a distrito frente a la media municipal ({municipalAvgPercent.toFixed(1)}% para {ownParty.acronym}).
        </p>
      </div>

      {/* Gráfico Comparativo de Votos Recharts */}
      <DistrictCharts data={chartData} />

      {/* Tabla Matriz Comparativa (Sección 5) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-slate-800 text-base">Matriz Territorial de Competitividad</h2>
            <p className="text-xs text-slate-500">Compara el resultado propio frente al primer competidor y la media del municipio.</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {campaign.districts.length} distritos analizados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="p-4">Distrito</th>
                <th className="p-4">Censo / Part.</th>
                <th className="p-4">Líder 2023</th>
                <th className="p-4 text-center">Nuestra Posición</th>
                <th className="p-4 text-right">Votos Propios</th>
                <th className="p-4 text-right">% Distrito</th>
                <th className="p-4 text-center">vs Media Municipal</th>
                <th className="p-4 text-right">Margen / Brecha</th>
                <th className="p-4">Clasificación Estratégica</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaign.districts.map((d) => {
                const totalDistVotes = d.electionResults.reduce((s, r) => s + r.votes, 0);
                const ownResult = d.electionResults.find((r) => r.partyId === ownParty.id);
                const ownVotes = ownResult ? ownResult.votes : 0;
                const ownPct = totalDistVotes > 0 ? (ownVotes / totalDistVotes) * 100 : 0;

                const topResult = d.electionResults[0];
                const isOwnLeader = topResult?.partyId === ownParty.id;
                const runnerUp = isOwnLeader ? d.electionResults[1] : topResult;

                // Margen de votos con el rival inmediato
                const voteDiff = isOwnLeader
                  ? ownVotes - (runnerUp?.votes || 0)
                  : ownVotes - (topResult?.votes || 0);

                const vsMedia = ownPct - municipalAvgPercent;
                const turnoutPct = d.electoralRoll > 0 ? (totalDistVotes / d.electoralRoll) * 100 : 0;

                // Posición
                const positionIndex = d.electionResults.findIndex((r) => r.partyId === ownParty.id) + 1;

                return (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>{d.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal pl-5 block">Cód: {d.code}</span>
                    </td>

                    <td className="p-4">
                      <div className="font-medium text-slate-700">{d.electoralRoll.toLocaleString()}</div>
                      <div className="text-[11px] text-slate-400">Part: {turnoutPct.toFixed(1)}%</div>
                    </td>

                    <td className="p-4">
                      {topResult ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: topResult.party.colorHex }}></span>
                          <span className="font-semibold text-slate-800">{topResult.party.acronym}</span>
                          <span className="text-slate-400 text-[11px]">({((topResult.votes / totalDistVotes) * 100).toFixed(1)}%)</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>

                    <td className="p-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded font-bold text-xs ${
                        positionIndex === 1
                          ? 'bg-emerald-100 text-emerald-800'
                          : positionIndex === 2
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {positionIndex}º lugar
                      </span>
                    </td>

                    <td className="p-4 text-right font-bold text-slate-800">{ownVotes.toLocaleString()}</td>

                    <td className="p-4 text-right font-bold text-emerald-700">{ownPct.toFixed(1)}%</td>

                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center font-bold gap-0.5 ${
                        vsMedia >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {vsMedia >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {vsMedia >= 0 ? `+${vsMedia.toFixed(1)}%` : `${vsMedia.toFixed(1)}%`}
                      </span>
                    </td>

                    <td className="p-4 text-right font-medium">
                      <span className={voteDiff >= 0 ? 'text-emerald-700 font-bold' : 'text-slate-600'}>
                        {voteDiff >= 0 ? `+${voteDiff.toLocaleString()} (lidera)` : `${voteDiff.toLocaleString()} vs ${topResult?.party.acronym}`}
                      </span>
                    </td>

                    <td className="p-4">
                      <ClassificationEditor districtId={d.id} initialClassification={d.classification} disabled={!canClassify} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fichas Territoriales Estratégicas */}
      <div className="space-y-4">
        <h2 className="font-bold text-slate-800 text-lg">Estrategia y Problemas Clave por Distrito</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {campaign.districts.map((d) => (
            <div key={d.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-red-600" />
                  {d.name}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                  {d.code}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-slate-500 block">Objetivo Estratégico:</span>
                  <p className="font-medium text-slate-800 mt-0.5">{d.strategicGoal || 'Definir objetivo territorial.'}</p>
                </div>

                <div>
                  <span className="font-semibold text-slate-500 block">Problemas Principales:</span>
                  <p className="text-slate-600 mt-0.5">{d.mainIssues || 'No detallados.'}</p>
                </div>

                <div>
                  <span className="font-semibold text-slate-500 block">Público Prioritario:</span>
                  <p className="text-slate-600 mt-0.5">{d.targetAudience || 'General.'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
