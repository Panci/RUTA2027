'use client';

import React, { useState, useMemo } from 'react';
import { calculateDhondt, PartyVoteInput } from '@/lib/dhondt';
import { AlertTriangle, TrendingUp, Info, RefreshCw, Sliders, ShieldCheck } from 'lucide-react';

interface SimulationParty {
  id: string;
  name: string;
  acronym: string;
  colorHex: string;
  isOwnParty: boolean;
  baseVotes: number;
}

export default function SimulationClient({ initialParties }: { initialParties: SimulationParty[] }) {
  const [partiesState, setPartiesState] = useState(
    initialParties.map((p) => ({
      ...p,
      currentVotes: p.baseVotes,
      active: true,
    }))
  );

  const [totalSeats, setTotalSeats] = useState<number>(25);
  const [thresholdPercent, setThresholdPercent] = useState<number>(5.0);
  const [turnoutAdjustment, setTurnoutAdjustment] = useState<number>(0); // -20% a +20%
  const [blankVotes, setBlankVotes] = useState<number>(350);

  // Recálculo dinámico con Ley D'Hondt
  const simulationResult = useMemo(() => {
    const activeParties: PartyVoteInput[] = partiesState
      .filter((p) => p.active)
      .map((p) => {
        // Ajustar por movilización global
        const multiplier = 1 + turnoutAdjustment / 100;
        return {
          id: p.id,
          name: p.name,
          acronym: p.acronym,
          votes: Math.round(p.currentVotes * multiplier),
          colorHex: p.colorHex,
        };
      });

    return calculateDhondt(activeParties, totalSeats, blankVotes, thresholdPercent);
  }, [partiesState, totalSeats, thresholdPercent, turnoutAdjustment, blankVotes]);

  const handleVoteChange = (id: string, newVotes: number) => {
    setPartiesState((prev) =>
      prev.map((p) => (p.id === id ? { ...p, currentVotes: Math.max(0, newVotes) } : p))
    );
  };

  const handleToggleParty = (id: string) => {
    setPartiesState((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const handleReset = () => {
    setPartiesState(
      initialParties.map((p) => ({
        ...p,
        currentVotes: p.baseVotes,
        active: true,
      }))
    );
    setTurnoutAdjustment(0);
    setTotalSeats(25);
    setThresholdPercent(5.0);
  };

  return (
    <div className="space-y-6">
      {/* Advertencia Legal y Metodológica Ineludible (Sección 6) */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-900 flex items-start gap-3 shadow-sm">
        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold block uppercase tracking-wide text-red-800">
            Aviso Metodológico de Simulación Electoral:
          </strong>
          Este módulo genera <em>escenarios aritméticos hipotéticos</em> basados en la Ley D'Hondt y los parámetros introducidos manualmente por el usuario. 
          <strong> En ningún caso representa un sondeo, una predicción científica ni una garantía de resultados electorales.</strong> 
          Con un único histórico electoral (2023), los indicadores de volatilidad se clasifican estrictamente como <em>No disponibles</em>.
        </div>
      </div>

      {/* Panel Superior: Escaños Asignados en la Simulación */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-red-400">
              Reparto Orientativo de Concejales (Ley D'Hondt)
            </span>
            <h2 className="text-2xl font-bold mt-1">Pleno Simulado: {totalSeats} Concejales</h2>
          </div>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Restablecer Valores Base 2023
          </button>
        </div>

        {/* Barra de Distribución del Pleno */}
        <div className="mt-5 space-y-2">
          <div className="w-full bg-slate-800 h-6 rounded-lg overflow-hidden flex shadow-inner border border-slate-700/80">
            {simulationResult.results
              .filter((r) => r.seats > 0)
              .map((r) => {
                const widthPct = (r.seats / totalSeats) * 100;
                return (
                  <div
                    key={r.partyId}
                    style={{ width: `${widthPct}%`, backgroundColor: r.colorHex || '#64748b' }}
                    className="h-full flex items-center justify-center font-black text-xs text-white shadow-sm transition-all duration-300"
                    title={`${r.acronym}: ${r.seats} concejales (${r.percentOfValidVotes}%)`}
                  >
                    {widthPct > 8 && `${r.acronym} (${r.seats})`}
                  </div>
                );
              })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Mayoría absoluta: <strong>{Math.floor(totalSeats / 2) + 1} concejales</strong></span>
            <span>Votos válidos simulados: <strong>{simulationResult.totalValidVotes.toLocaleString()}</strong></span>
            <span>Barrera electoral (5%): <strong>{simulationResult.thresholdVotes.toLocaleString()} votos</strong></span>
          </div>
        </div>

        {/* Fichas de Concejales por Partido */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {simulationResult.results.map((r) => (
            <div key={r.partyId} className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white px-2 py-0.5 rounded text-[10px]" style={{ backgroundColor: r.colorHex }}>
                  {r.acronym}
                </span>
                {r.isExcludedByThreshold && (
                  <span className="text-[10px] text-red-400 font-bold bg-red-950 px-1 py-0.5 rounded">
                    Bajo 5%
                  </span>
                )}
              </div>
              <div className="pt-1">
                <span className="text-xl font-black text-white">{r.seats}</span>
                <span className="text-slate-400 text-[11px] ml-1">concejales</span>
              </div>
              <div className="text-[11px] text-slate-400">
                {r.votes.toLocaleString()} votos ({r.percentOfValidVotes}%)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controles de Escenarios y Parámetros */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parámetros Generales de Simulación */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-slate-800 text-base">Parámetros del Municipio</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Número de Concejales a Elegir:</span>
                <strong className="text-slate-900 text-sm">{totalSeats}</strong>
              </div>
              <input
                type="range"
                min="11"
                max="35"
                step="2"
                value={totalSeats}
                onChange={(e) => setTotalSeats(parseInt(e.target.value, 10))}
                className="w-full accent-red-600"
              />
              <span className="text-[11px] text-slate-400 block mt-0.5">Valle Real: 25 concejales (población entre 50k y 100k hab.)</span>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Variación General de Participación:</span>
                <strong className={turnoutAdjustment >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                  {turnoutAdjustment >= 0 ? `+${turnoutAdjustment}%` : `${turnoutAdjustment}%`}
                </strong>
              </div>
              <input
                type="range"
                min="-20"
                max="20"
                step="1"
                value={turnoutAdjustment}
                onChange={(e) => setTurnoutAdjustment(parseInt(e.target.value, 10))}
                className="w-full accent-slate-800"
              />
              <span className="text-[11px] text-slate-400 block mt-0.5">Simula mayor o menor afluencia a las urnas.</span>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Barrera Electoral Legal:</span>
                <strong className="text-slate-900">{thresholdPercent}%</strong>
              </div>
              <input
                type="range"
                min="3"
                max="8"
                step="0.5"
                value={thresholdPercent}
                onChange={(e) => setThresholdPercent(parseFloat(e.target.value))}
                className="w-full accent-slate-800"
              />
              <span className="text-[11px] text-slate-400 block mt-0.5">LOREG Municipal en España: 5.0% estricto.</span>
            </div>

            {/* Mención a indicadores no disponibles */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-500 text-[11px] space-y-1">
              <span className="font-bold text-slate-700 block">Indicadores Históricos Complementarios:</span>
              <p>• Volatilidad interelectoral: <span className="text-slate-400 font-semibold">No disponible (1 histórico)</span></p>
              <p>• Tendencia demoscópica continua: <span className="text-slate-400 font-semibold">No disponible</span></p>
            </div>
          </div>
        </div>

        {/* Ajustes de Votos por Candidatura */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Ajuste de Apoyo por Candidatura</h3>
              <p className="text-xs text-slate-500">Modifica los votos o activa/desactiva candidaturas para simular alianzas.</p>
            </div>
          </div>

          <div className="space-y-3">
            {partiesState.map((p) => {
              const res = simulationResult.results.find((r) => r.partyId === p.id);
              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-lg border text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                    p.active ? 'bg-slate-50 border-slate-200' : 'bg-slate-100/60 border-slate-200 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3 w-48 shrink-0">
                    <input
                      type="checkbox"
                      checked={p.active}
                      onChange={() => handleToggleParty(p.id)}
                      className="rounded text-red-600"
                      title="Activar / Desactivar candidatura del escenario"
                    />
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: p.colorHex }}
                    ></span>
                    <div>
                      <span className="font-bold text-slate-800 block leading-tight">{p.acronym}</span>
                      <span className="text-[11px] text-slate-500 truncate max-w-[130px] block">{p.name}</span>
                    </div>
                  </div>

                  <div className="flex-1 w-full flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max={Math.max(25000, p.baseVotes * 2)}
                      step="50"
                      disabled={!p.active}
                      value={p.currentVotes}
                      onChange={(e) => handleVoteChange(p.id, parseInt(e.target.value, 10))}
                      className="w-full accent-slate-700"
                    />
                    <div className="w-24 text-right shrink-0">
                      <input
                        type="number"
                        disabled={!p.active}
                        value={p.currentVotes}
                        onChange={(e) => handleVoteChange(p.id, parseInt(e.target.value, 10))}
                        className="w-20 p-1 text-right text-xs font-bold border border-slate-300 rounded bg-white text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="w-24 text-right shrink-0">
                    <span className="font-bold text-slate-800 text-sm">{res?.seats || 0}</span>
                    <span className="text-slate-400 text-[11px] ml-1">concejales</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
