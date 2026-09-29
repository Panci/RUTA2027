'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { calculateDhondt, PartyVoteInput } from '@/lib/dhondt';
import {
  AlertTriangle,
  RefreshCw,
  Sliders,
  BarChart3,
  Percent,
  CheckCircle2,
  Users,
} from 'lucide-react';

interface SimulationParty {
  id: string;
  name: string;
  acronym: string;
  colorHex: string;
  isOwnParty: boolean;
  baseVotes: number;
  baseSeats?: number;
}

// Mapeo armónico a paleta de tonos pastel elegantes
export function toPastelColor(hex?: string): string {
  if (!hex) return '#94a3b8';
  const h = hex.toLowerCase();
  if (h === '#dc2626' || h === '#ef4444' || h === '#b91c1c') return '#fb7185'; // Pastel Rose / Coral (PSOE)
  if (h === '#2563eb' || h === '#1d4ed8' || h === '#3b82f6') return '#60a5fa'; // Pastel Sky Blue (PP)
  if (h === '#16a34a' || h === '#15803d' || h === '#22c55e') return '#34d399'; // Pastel Mint Green (AVANZA)
  if (h === '#4ade80' || h === '#86efac') return '#86efac'; // Pastel Pistachio / Lime (VOX)
  if (h === '#9333ea' || h === '#7c3aed' || h === '#a855f7') return '#c084fc'; // Pastel Lavender (IU-PODEMOS)
  if (h === '#ea580c' || h === '#f97316') return '#fb923c'; // Pastel Peach / Orange
  return hex;
}

export default function SimulationClient({
  initialParties,
  defaultSeats = 9,
  defaultCensus = 1200,
  defaultBlankVotes = 12,
  defaultNullVotes = 15,
  municipalityName = 'Municipio',
  readOnly = false,
}: {
  initialParties: SimulationParty[];
  defaultSeats?: number;
  defaultCensus?: number;
  defaultBlankVotes?: number;
  defaultNullVotes?: number;
  municipalityName?: string;
  readOnly?: boolean;
}) {
  const [partiesState, setPartiesState] = useState(
    initialParties.map((p) => ({
      ...p,
      currentVotes: p.baseVotes,
      active: true,
    }))
  );

  const [totalSeats, setTotalSeats] = useState<number>(defaultSeats);
  const [census, setCensus] = useState<number>(defaultCensus);
  const [blankVotes, setBlankVotes] = useState<number>(defaultBlankVotes);
  const [nullVotes, setNullVotes] = useState<number>(defaultNullVotes);
  const [thresholdPercent, setThresholdPercent] = useState<number>(0.0); // 0.0% por defecto (en municipales sin barrera electoral)
  const [turnoutAdjustment, setTurnoutAdjustment] = useState<number>(0); // -30% a +30%
  const [editingPercent, setEditingPercent] = useState<{ [partyId: string]: string }>({});

  // Sincronizar automáticamente cuando cambia el municipio activo o sus datos
  useEffect(() => {
    setPartiesState(
      initialParties.map((p) => ({
        ...p,
        currentVotes: p.baseVotes,
        active: true,
      }))
    );
    setTotalSeats(defaultSeats);
    setCensus(defaultCensus);
    setBlankVotes(defaultBlankVotes);
    setNullVotes(defaultNullVotes);
    setTurnoutAdjustment(0);
    setThresholdPercent(0.0);
    setEditingPercent({});
  }, [initialParties, defaultSeats, defaultCensus, defaultBlankVotes, defaultNullVotes]);

  // Votos válidos totales de referencia municipal en 2023 (Base histórica)
  const base2023ValidVotes = useMemo(() => {
    return initialParties.reduce((sum, p) => sum + p.baseVotes, 0) + defaultBlankVotes;
  }, [initialParties, defaultBlankVotes]);

  // Votos base totales de las candidaturas activas
  const baseActiveSum = useMemo(() => {
    return partiesState
      .filter((p) => p.active)
      .reduce((sum, p) => sum + p.baseVotes, 0);
  }, [partiesState]);

  // Recálculo dinámico con Ley D'Hondt
  const simulationResult = useMemo(() => {
    const activeParties: PartyVoteInput[] = partiesState
      .filter((p) => p.active)
      .map((p) => ({
        id: p.id,
        name: p.name,
        acronym: p.acronym,
        votes: Math.max(0, p.currentVotes),
        colorHex: p.colorHex,
      }));

    return calculateDhondt(activeParties, totalSeats, blankVotes, thresholdPercent);
  }, [partiesState, totalSeats, blankVotes, thresholdPercent]);

  // Votos totales de las candidaturas simuladas (sin blancos)
  const currentPartiesVotesSum = useMemo(() => {
    return partiesState
      .filter((p) => p.active)
      .reduce((sum, p) => sum + Math.max(0, p.currentVotes), 0);
  }, [partiesState]);

  // Votos válidos = suma candidaturas + votos en blanco
  const totalValidVotes = currentPartiesVotesSum + Math.max(0, blankVotes);

  // Total votos emitidos en urnas (participación) = válidos + nulos
  const totalTurnoutVotes = totalValidVotes + Math.max(0, nullVotes);

  // Indicadores de participación y abstención
  const turnoutPercent = census > 0 ? (totalTurnoutVotes / census) * 100 : 0;
  const totalAbstention = Math.max(0, census - totalTurnoutVotes);
  const abstentionPercent = census > 0 ? (totalAbstention / census) * 100 : 0;
  const blankPercent = totalValidVotes > 0 ? (blankVotes / totalValidVotes) * 100 : 0;
  const nullPercent = totalTurnoutVotes > 0 ? (nullVotes / totalTurnoutVotes) * 100 : 0;

  // Diferencia absoluta de votos respecto al histórico 2023
  const diffVotesVsBase = currentPartiesVotesSum - baseActiveSum;

  /**
   * Sincronización A: Cuando se modifica la "Variación General de Participación" (Panel Izquierdo),
   * se recalculan proporcionalmente los votos de todas las candidaturas activas en el Panel Derecho.
   */
  const handleTurnoutChange = (newTurnout: number) => {
    const activeParties = partiesState.filter((p) => p.active);
    const currentActiveSum = activeParties.reduce((sum, p) => sum + p.currentVotes, 0);
    const activeBase = activeParties.reduce((sum, p) => sum + p.baseVotes, 0);

    const targetSum = Math.round(activeBase * (1 + newTurnout / 100));
    const ratio = currentActiveSum > 0 ? targetSum / currentActiveSum : 1 + newTurnout / 100;

    setTurnoutAdjustment(newTurnout);
    setPartiesState((prev) =>
      prev.map((p) => ({
        ...p,
        currentVotes: p.active ? Math.max(0, Math.round(p.currentVotes * ratio)) : p.currentVotes,
      }))
    );
  };

  /**
   * Sincronización B: Cuando se modifica el apoyo a una candidatura individual (Panel Derecho),
   * se actualiza su voto y se recalcula automáticamente la variación implícita de participación.
   */
  const handleVoteChange = (id: string, newVotes: number) => {
    const safeVotes = Math.max(0, isNaN(newVotes) ? 0 : Math.round(newVotes));

    setPartiesState((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, currentVotes: safeVotes } : p));

      const activeParties = updated.filter((p) => p.active);
      const newActiveSum = activeParties.reduce((sum, p) => sum + p.currentVotes, 0);
      const activeBase = activeParties.reduce((sum, p) => sum + p.baseVotes, 0);

      if (activeBase > 0) {
        const impliedTurnout = Math.round(((newActiveSum - activeBase) / activeBase) * 100);
        setTurnoutAdjustment(Math.max(-50, Math.min(50, impliedTurnout)));
      }

      return updated;
    });
  };

  /**
   * Sincronización C: Activar o desactivar una candidatura
   */
  const handleToggleParty = (id: string) => {
    setPartiesState((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p));

      const activeParties = updated.filter((p) => p.active);
      const newActiveSum = activeParties.reduce((sum, p) => sum + p.currentVotes, 0);
      const activeBase = activeParties.reduce((sum, p) => sum + p.baseVotes, 0);

      if (activeBase > 0) {
        const impliedTurnout = Math.round(((newActiveSum - activeBase) / activeBase) * 100);
        setTurnoutAdjustment(Math.max(-50, Math.min(50, impliedTurnout)));
      }

      return updated;
    });
  };

  /**
   * Sincronización Bidireccional: Cuando el usuario modifica el % objetivo en la tabla,
   * se calculan automáticamente los votos que necesita para alcanzar exactamente ese porcentaje
   * respecto a la suma de las demás candidaturas activas y el voto en blanco.
   * Fórmula: V_necesarios = (targetPercent * V_otros) / (100 - targetPercent)
   */
  const handlePercentChange = (id: string, targetPercent: number) => {
    const clampedPercent = Math.max(0, Math.min(99.0, isNaN(targetPercent) ? 0 : targetPercent));
    const activeParties = partiesState.filter((p) => p.active && p.id !== id);
    const otherPartiesSum = activeParties.reduce((sum, p) => sum + Math.max(0, p.currentVotes), 0);
    const othersTotal = otherPartiesSum + Math.max(0, blankVotes);

    let neededVotes = 0;
    if (clampedPercent <= 0) {
      neededVotes = 0;
    } else if (othersTotal === 0) {
      const party = partiesState.find((p) => p.id === id);
      neededVotes = party ? Math.max(1, party.baseVotes) : 100;
    } else {
      neededVotes = Math.round((clampedPercent * othersTotal) / (100 - clampedPercent));
    }

    handleVoteChange(id, neededVotes);
  };

  const handleReset = () => {
    setPartiesState(
      initialParties.map((p) => ({
        ...p,
        currentVotes: p.baseVotes,
        active: true,
      }))
    );
    setEditingPercent({});
    setTurnoutAdjustment(0);
    setTotalSeats(defaultSeats);
    setCensus(defaultCensus);
    setBlankVotes(defaultBlankVotes);
    setNullVotes(defaultNullVotes);
    setThresholdPercent(0.0);
  };

  return (
    <div className="space-y-6">
      {/* Advertencia Legal y Metodológica Ineludible */}
      <div className="bg-rose-50/60 border border-rose-200/70 rounded-2xl p-4 text-xs text-rose-950 flex items-start gap-3 shadow-2xs">
        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold block uppercase tracking-wide text-rose-900">
            Aviso Metodológico de Simulación Electoral:
          </strong>
          Este módulo genera <em>escenarios aritméticos hipotéticos</em> basados en la Ley D'Hondt y los parámetros introducidos manualmente por el usuario.
          <strong> En ningún caso representa un sondeo, una predicción científica ni una garantía de resultados electorales.</strong>
          Con un único histórico electoral (2023), los indicadores de volatilidad se clasifican estrictamente como <em>No disponibles</em>.
        </div>
      </div>

      {/* Panel Superior: Escaños Asignados en la Simulación */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-500 shadow-2xs shrink-0">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-extrabold text-rose-600 bg-rose-50/80 px-2.5 py-0.5 rounded-full border border-rose-200/80">
                Reparto Orientativo de Concejales (Ley D'Hondt)
              </span>
              <h2 className="text-2xl font-black mt-1 text-slate-900">
                Pleno Simulado: {totalSeats} Concejales
              </h2>
            </div>
          </div>
          {!readOnly ? (
            <button
              onClick={handleReset}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-slate-200/90 shadow-2xs hover:border-slate-300"
            >
              <RefreshCw className="w-3.5 h-3.5 text-rose-500" />
              Restablecer Valores Base 2023
            </button>
          ) : (
            <div className="px-3.5 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs">
              👁️ Modo Solo Lectura (Línea Base 2023)
            </div>
          )}
        </div>

        {/* Barra de Distribución del Pleno con tonos pastel */}
        <div className="space-y-3">
          <div className="w-full bg-slate-100/90 h-8 rounded-xl overflow-hidden flex shadow-inner border border-slate-200/80 p-0.5">
            {simulationResult.results
              .filter((r) => r.seats > 0)
              .map((r) => {
                const widthPct = (r.seats / totalSeats) * 100;
                return (
                  <div
                    key={r.partyId}
                    style={{ width: `${widthPct}%`, backgroundColor: toPastelColor(r.colorHex) }}
                    className="h-full first:rounded-l-[9px] last:rounded-r-[9px] flex items-center justify-center font-black text-xs text-slate-900 shadow-2xs transition-all duration-300"
                    title={`${r.acronym}: ${r.seats} concejales (${r.percentOfValidVotes.toFixed(1)}%)`}
                  >
                    {widthPct > 7 && `${r.acronym} (${r.seats})`}
                  </div>
                );
              })}
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 pt-0.5 gap-3 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
              Mayoría absoluta: <strong className="text-slate-900 font-extrabold">{Math.floor(totalSeats / 2) + 1} concejales</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500 shrink-0"></span>
              Censo: <strong className="text-slate-900 font-extrabold">{census.toLocaleString()}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
              Participación: <strong className="text-slate-900 font-extrabold">{totalTurnoutVotes.toLocaleString()} ({turnoutPercent.toFixed(1)}%)</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
              Abstención: <strong className="text-slate-900 font-extrabold">{totalAbstention.toLocaleString()} ({abstentionPercent.toFixed(1)}%)</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
              Válidos: <strong className="text-slate-900 font-extrabold">{totalValidVotes.toLocaleString()}</strong>
            </span>
            {thresholdPercent > 0 ? (
              <span className="flex items-center gap-1.5 text-rose-600 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                Barrera ({thresholdPercent}%): {simulationResult.thresholdVotes.toLocaleString()} votos
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0"></span>
                Sin barrera legal (0%)
              </span>
            )}
          </div>
        </div>

        {/* Fichas de Concejales por Partido */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          {simulationResult.results.map((r) => (
            <div
              key={r.partyId}
              className="bg-slate-50/70 hover:bg-white p-3.5 rounded-2xl border border-slate-200/90 text-xs space-y-1.5 transition-all shadow-2xs hover:shadow-xs group"
            >
              <div className="flex items-center justify-between gap-1.5">
                <span
                  className="font-black text-slate-900 px-2.5 py-0.5 rounded-lg text-[11px] shadow-2xs border border-black/5"
                  style={{ backgroundColor: toPastelColor(r.colorHex) }}
                >
                  {r.acronym}
                </span>
                {r.isExcludedByThreshold ? (
                  <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/80">
                    Bajo {thresholdPercent}%
                  </span>
                ) : (
                  r.seats > 0 && (
                    <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200/80">
                      {((r.seats / totalSeats) * 100).toFixed(0)}% pleno
                    </span>
                  )
                )}
              </div>
              <div className="pt-1">
                <span className="text-2xl font-black text-slate-900">{r.seats}</span>
                <span className="text-slate-500 text-xs font-semibold ml-1.5">concejales</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {r.votes.toLocaleString()} votos <span className="text-slate-400">({r.percentOfValidVotes.toFixed(1)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controles de Escenarios y Parámetros Sincronizados */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parámetros del Municipio (Columna Izquierda) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-slate-800 text-base">Parámetros del Municipio</h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* Número de Concejales */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Número de Concejales a Elegir:</span>
                <strong className="text-slate-900 text-sm font-extrabold">{totalSeats} concejales</strong>
              </div>
              <input
                type="range"
                min="5"
                max="35"
                step="2"
                value={totalSeats}
                disabled={readOnly}
                onChange={(e) => setTotalSeats(parseInt(e.target.value, 10))}
                className="w-full accent-rose-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                <span>Escala legal art. 179 LOREG</span>
                <span className="font-semibold text-rose-600">Base {municipalityName}: {defaultSeats} concejales</span>
              </div>
            </div>

            {/* Variación General de Participación (Sincronizada) */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Variación General de Participación:</span>
                <strong
                  className={`text-sm font-extrabold px-2.5 py-0.5 rounded-lg ${
                    turnoutAdjustment > 0
                      ? 'text-emerald-700 bg-emerald-50/80 border border-emerald-200/70'
                      : turnoutAdjustment < 0
                      ? 'text-rose-700 bg-rose-50/80 border border-rose-200/70'
                      : 'text-slate-700 bg-slate-100/80'
                  }`}
                >
                  {turnoutAdjustment > 0 ? `+${turnoutAdjustment}%` : `${turnoutAdjustment}%`}
                </strong>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                step="1"
                value={turnoutAdjustment}
                disabled={readOnly}
                onChange={(e) => handleTurnoutChange(parseInt(e.target.value, 10))}
                className="w-full accent-rose-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              />
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Sincronizado: al mover este control se recalculan proporcionalmente los votos de todas las candidaturas.
              </span>
            </div>

            {/* Censo Electoral y Datos de Urnas (Blancos y Nulos) */}
            <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/90 text-slate-700 text-xs space-y-3">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                <BarChart3 className="w-4 h-4 text-rose-500" />
                <span>Censo y Votos en Urna</span>
              </div>

              {/* Inputs Editables de Censo, Blancos y Nulos */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5 truncate" title="Censo Electoral Total">
                    Censo Total
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={census}
                    disabled={readOnly}
                    onChange={(e) => setCensus(Math.max(1, parseInt(e.target.value, 10) || 0))}
                    className="w-full px-2 py-1 text-center font-bold text-slate-900 bg-white border border-slate-200 rounded-lg text-xs shadow-2xs focus:ring-2 focus:ring-rose-400/30 focus:border-rose-400 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5 truncate" title="Votos en Blanco">
                    V. Blancos
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={blankVotes}
                    disabled={readOnly}
                    onChange={(e) => setBlankVotes(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full px-2 py-1 text-center font-bold text-slate-900 bg-white border border-slate-200 rounded-lg text-xs shadow-2xs focus:ring-2 focus:ring-rose-400/30 focus:border-rose-400 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5 truncate" title="Votos Nulos">
                    V. Nulos
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={nullVotes}
                    disabled={readOnly}
                    onChange={(e) => setNullVotes(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full px-2 py-1 text-center font-bold text-slate-900 bg-white border border-slate-200 rounded-lg text-xs shadow-2xs focus:ring-2 focus:ring-rose-400/30 focus:border-rose-400 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </div>

              {/* Métricas calculadas en vivo de Participación y Abstención */}
              <div className="space-y-1.5 pt-1 border-t border-slate-200/80 text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Participación (Votantes):</span>
                  <span className="font-extrabold text-blue-700">
                    {totalTurnoutVotes.toLocaleString()} ({turnoutPercent.toFixed(1)}%)
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Abstención:</span>
                  <span className="font-extrabold text-amber-700">
                    {totalAbstention.toLocaleString()} ({abstentionPercent.toFixed(1)}%)
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Total Votos Válidos:</span>
                  <span className="font-bold text-slate-900">
                    {totalValidVotes.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span>Suma candidaturas:</span>
                  <span className="font-semibold text-slate-700">{currentPartiesVotesSum.toLocaleString()} votos</span>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span>Diferencia vs Base 2023:</span>
                  <span
                    className={`font-bold ${
                      diffVotesVsBase > 0
                        ? 'text-emerald-700'
                        : diffVotesVsBase < 0
                        ? 'text-rose-700'
                        : 'text-slate-600'
                    }`}
                  >
                    {diffVotesVsBase > 0 ? `+${diffVotesVsBase.toLocaleString()}` : diffVotesVsBase.toLocaleString()} (
                    {turnoutAdjustment >= 0 ? `+${turnoutAdjustment}%` : `${turnoutAdjustment}%`})
                  </span>
                </div>
              </div>
            </div>

            {/* Barrera Electoral (Sin barrera por defecto en municipales) */}
            <div>
              <div className="flex justify-between items-center font-semibold text-slate-700 mb-1.5">
                <span>Barrera Electoral Legal:</span>
                <span className={`text-xs font-black px-2 py-0.5 rounded-lg border ${
                  thresholdPercent === 0
                    ? 'bg-slate-100 text-slate-700 border-slate-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {thresholdPercent === 0 ? '0% (Sin barrera municipal)' : `${thresholdPercent}%`}
                </span>
              </div>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => setThresholdPercent(0.0)}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-xl border transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    thresholdPercent === 0
                      ? 'bg-rose-500 text-white border-rose-600 shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/90'
                  }`}
                >
                  Sin Barrera (0%)
                </button>
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => setThresholdPercent(5.0)}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-xl border transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    thresholdPercent === 5.0
                      ? 'bg-rose-500 text-white border-rose-600 shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/90'
                  }`}
                >
                  LOREG (5.0%)
                </button>
              </div>
              <input
                type="range"
                min="0.0"
                max="10.0"
                step="0.5"
                value={thresholdPercent}
                disabled={readOnly}
                onChange={(e) => setThresholdPercent(parseFloat(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              />
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {thresholdPercent === 0
                  ? 'En elecciones municipales no aplica barrera excluyente; todos los votos computan directamente para el reparto D\'Hondt.'
                  : `Barrera activa: se excluyen candidaturas bajo el ${thresholdPercent}% (${simulationResult.thresholdVotes.toLocaleString()} votos).`}
              </span>
            </div>

            {/* Mención a indicadores no disponibles */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-500 text-[11px] space-y-1">
              <span className="font-bold text-slate-700 block">Indicadores Históricos Complementarios:</span>
              <p>
                • Volatilidad interelectoral: <span className="text-slate-400 font-semibold">No disponible (1 histórico)</span>
              </p>
              <p>
                • Tendencia demoscópica continua: <span className="text-slate-400 font-semibold">No disponible</span>
              </p>
            </div>
          </div>
        </div>

        {/* Ajustes de Votos por Candidatura (Columna Derecha) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Ajuste de Apoyo por Candidatura</h3>
              <p className="text-xs text-slate-500">
                Modifica los votos o activa/desactiva candidaturas para simular alianzas y trasvases.
              </p>
            </div>
            <div className="text-right flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/80">
                Suma votos: <strong className="text-slate-900">{currentPartiesVotesSum.toLocaleString()}</strong>
              </span>
            </div>
          </div>

          {/* Encabezados de Columnas */}
          <div className="hidden sm:flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
            <span className="w-36 md:w-40">Candidatura</span>
            <span className="w-20 md:w-24 text-center">Votos 2023</span>
            <span className="flex-1 text-center">Deslizador</span>
            <span className="w-24 md:w-28 text-center">Votos Simulados</span>
            <span className="w-20 md:w-24 text-center">% Válido</span>
            <span className="w-24 md:w-28 text-right">Reparto</span>
          </div>

          <div className="space-y-3">
            {partiesState.map((p) => {
              const res = simulationResult.results.find((r) => r.partyId === p.id);
              const maxRange = Math.max(
                400,
                Math.round(Math.max(baseActiveSum * 1.5, p.baseVotes * 2.5, p.currentVotes * 1.3))
              );
              const stepValue = baseActiveSum > 2000 ? 10 : baseActiveSum > 500 ? 5 : 1;
              const currentPercent = res?.percentOfValidVotes || 0;
              const basePercent = base2023ValidVotes > 0 ? (p.baseVotes / base2023ValidVotes) * 100 : 0;
              const voteDiff = p.currentVotes - p.baseVotes;
              const seatDiff = (res?.seats || 0) - (p.baseSeats ?? 0);

              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                    p.active ? 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs' : 'bg-slate-100/50 border-slate-200/60 opacity-50'
                  }`}
                >
                  {/* Identificación de Candidatura */}
                  <div className="flex items-center gap-2.5 w-36 md:w-40 shrink-0">
                    <input
                      type="checkbox"
                      checked={p.active}
                      disabled={readOnly}
                      onChange={() => handleToggleParty(p.id)}
                      className="rounded text-rose-500 focus:ring-rose-400 cursor-pointer disabled:cursor-not-allowed h-4 w-4"
                      title="Activar / Desactivar candidatura del escenario"
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: toPastelColor(p.colorHex) }}
                    ></span>
                    <div className="truncate">
                      <span className="font-bold text-slate-800 block leading-tight text-sm">
                        {p.acronym}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate block max-w-[110px] md:max-w-[130px]">
                        {p.name}
                      </span>
                    </div>
                  </div>

                  {/* Votos Base 2023 (Columna de referencia histórica fija) */}
                  <div className="w-20 md:w-24 shrink-0 text-center">
                    <span className="font-extrabold text-slate-700 text-xs block">
                      {p.baseVotes.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium block">
                      {basePercent.toFixed(1)}%{p.baseSeats !== undefined ? ` · ${p.baseSeats} c.` : ''}
                    </span>
                  </div>

                  {/* Slider de Votos */}
                  <div className="flex-1 w-full min-w-[90px] flex items-center px-1">
                    <input
                      type="range"
                      min="0"
                      max={maxRange}
                      step={stepValue}
                      disabled={readOnly || !p.active}
                      value={p.currentVotes}
                      onChange={(e) => handleVoteChange(p.id, parseInt(e.target.value, 10))}
                      className="w-full accent-rose-400 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  {/* Votos Simulados / Necesarios (Input editable + Diferencia vs 2023) */}
                  <div className="w-24 md:w-28 shrink-0 flex flex-col items-center justify-center">
                    <input
                      type="number"
                      min="0"
                      step={stepValue}
                      disabled={readOnly || !p.active}
                      value={p.currentVotes}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                        handleVoteChange(p.id, isNaN(val) ? 0 : val);
                      }}
                      className="w-20 px-2 py-1 text-center text-xs font-black text-slate-900 bg-slate-50/80 border border-slate-200 rounded-lg shadow-2xs focus:outline-none focus:ring-2 focus:ring-rose-400/30 focus:border-rose-400 focus:bg-white disabled:bg-slate-100 disabled:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      title="Votos necesarios o simulados para esta candidatura"
                    />
                    <div className="mt-0.5 text-[10px] font-bold">
                      {voteDiff > 0 ? (
                        <span className="text-emerald-700">+{voteDiff.toLocaleString()} dif.</span>
                      ) : voteDiff < 0 ? (
                        <span className="text-rose-700">{voteDiff.toLocaleString()} dif.</span>
                      ) : (
                        <span className="text-slate-400 font-normal">= base</span>
                      )}
                    </div>
                  </div>

                  {/* Porcentaje de Votos Válidos Objetivo (Editable: calcula votos que necesita) */}
                  <div className="w-20 md:w-24 shrink-0 text-center">
                    <div className="relative inline-flex items-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        disabled={readOnly || !p.active}
                        value={
                          editingPercent[p.id] !== undefined
                            ? editingPercent[p.id]
                            : currentPercent.toFixed(1)
                        }
                        onChange={(e) => {
                          const valStr = e.target.value;
                          setEditingPercent((prev) => ({ ...prev, [p.id]: valStr }));
                          const num = parseFloat(valStr);
                          if (!isNaN(num)) {
                            handlePercentChange(p.id, num);
                          }
                        }}
                        onBlur={() => {
                          setEditingPercent((prev) => {
                            const next = { ...prev };
                            delete next[p.id];
                            return next;
                          });
                        }}
                        className={`w-18 md:w-20 pr-4 pl-1.5 py-1 text-center text-xs font-black rounded-lg border shadow-2xs focus:outline-none focus:ring-2 focus:ring-rose-400/30 focus:border-rose-400 focus:bg-white disabled:bg-slate-100 disabled:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                          res?.isExcludedByThreshold
                            ? 'bg-rose-50/90 text-rose-700 border-rose-200/80'
                            : 'bg-slate-50/80 text-slate-800 border-slate-200/80'
                        }`}
                        title="Modifica el % objetivo para calcular automáticamente los votos necesarios"
                      />
                      <span className="absolute right-1.5 text-[10px] font-black text-slate-400 pointer-events-none">
                        %
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      {res?.isExcludedByThreshold ? (
                        <span className="text-rose-600 font-bold">Bajo {thresholdPercent}%</span>
                      ) : (
                        'válido'
                      )}
                    </span>
                  </div>

                  {/* Concejales Asignados + Comparativa vs 2023 */}
                  <div className="w-24 md:w-28 text-right shrink-0">
                    <div className="flex items-center justify-end gap-1">
                      <span className="font-black text-slate-900 text-base leading-none">
                        {res?.seats || 0}
                      </span>
                      <span className="text-slate-500 text-[11px]">concejales</span>
                    </div>
                    {p.baseSeats !== undefined && (
                      <div className="mt-0.5">
                        {seatDiff > 0 ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            +{seatDiff} vs 2023
                          </span>
                        ) : seatDiff < 0 ? (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            {seatDiff} vs 2023
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                            = vs 2023
                          </span>
                        )}
                      </div>
                    )}
                    {res?.isExcludedByThreshold && (
                      <span className="text-[10px] text-rose-600 font-bold bg-rose-50/90 px-1.5 py-0.5 rounded border border-rose-200/80 block mt-0.5 text-center">
                        Bajo {thresholdPercent}%
                      </span>
                    )}
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
