'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Target,
  Users,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Edit3,
  Plus,
  Trash2,
  X,
  Layers,
} from 'lucide-react';

interface PriorityItem {
  id: string;
  orderNumber: number;
  title: string;
  description: string;
  targetMetric: string | null;
  actionTasks?: any[];
}

interface StrategyData {
  id?: string;
  campaignId?: string;
  mainGoal: string;
  targetAudience: string;
  brandIdea1: string | null;
  brandIdea2: string | null;
  brandIdea3: string | null;
  messagesToRepeat: string | null;
  topicsToAvoid: string | null;
}

export default function PrioridadesClient({
  initialStrategy,
  initialPriorities,
  municipalityName,
  politicalGoal,
  readOnly = false,
}: {
  initialStrategy: StrategyData | null;
  initialPriorities: PriorityItem[];
  municipalityName: string;
  politicalGoal: string;
  readOnly?: boolean;
}) {
  const [strategy, setStrategy] = useState<StrategyData>(
    initialStrategy || {
      mainGoal: politicalGoal === 'GOBERNAR'
        ? `Revalidar la alcaldía y consolidar el progreso en ${municipalityName}.`
        : `Alcanzar la alcaldía de ${municipalityName} sumando la mayoría necesaria de concejales.`,
      targetAudience: 'Familias trabajadoras, autónomos, agricultores, personas mayores y juventud rural.',
      brandIdea1: `${municipalityName} avanza con hechos y cercanía.`,
      brandIdea2: 'Defensa de los servicios públicos, la sanidad y la educación en nuestro pueblo.',
      brandIdea3: 'Generación de oportunidades para que nadie tenga que marcharse por falta de empleo o vivienda.',
      messagesToRepeat: `La gestión transparente, la cercanía con cada vecino y la defensa del bienestar en ${municipalityName}.`,
      topicsToAvoid: 'Polémicas nacionales estériles y confrontaciones personales.',
    }
  );

  const [priorities, setPriorities] = useState<PriorityItem[]>(initialPriorities);

  // Modals state
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);
  const [editingPriority, setEditingPriority] = useState<PriorityItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Strategy Form State
  const [strategyForm, setStrategyForm] = useState({
    mainGoal: strategy.mainGoal,
    targetAudience: strategy.targetAudience,
    brandIdea1: strategy.brandIdea1 || '',
    brandIdea2: strategy.brandIdea2 || '',
    brandIdea3: strategy.brandIdea3 || '',
    messagesToRepeat: strategy.messagesToRepeat || '',
    topicsToAvoid: strategy.topicsToAvoid || '',
  });

  // Priority Form State
  const [priorityForm, setPriorityForm] = useState({
    id: '',
    orderNumber: 1,
    title: '',
    description: '',
    targetMetric: '',
  });

  // Open Strategy Modal
  const openEditStrategy = () => {
    setStrategyForm({
      mainGoal: strategy.mainGoal,
      targetAudience: strategy.targetAudience,
      brandIdea1: strategy.brandIdea1 || '',
      brandIdea2: strategy.brandIdea2 || '',
      brandIdea3: strategy.brandIdea3 || '',
      messagesToRepeat: strategy.messagesToRepeat || '',
      topicsToAvoid: strategy.topicsToAvoid || '',
    });
    setErrorMsg('');
    setIsStrategyModalOpen(true);
  };

  const handleSaveStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/strategy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(strategyForm),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar la estrategia.');
      }

      const updated = await res.json();
      setStrategy(updated);
      setIsStrategyModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Priority Modal (Create or Edit)
  const openCreatePriority = () => {
    setEditingPriority(null);
    setPriorityForm({
      id: '',
      orderNumber: priorities.length + 1,
      title: '',
      description: '',
      targetMetric: '',
    });
    setErrorMsg('');
    setIsPriorityModalOpen(true);
  };

  const openEditPriority = (p: PriorityItem) => {
    setEditingPriority(p);
    setPriorityForm({
      id: p.id,
      orderNumber: p.orderNumber,
      title: p.title,
      description: p.description,
      targetMetric: p.targetMetric || '',
    });
    setErrorMsg('');
    setIsPriorityModalOpen(true);
  };

  const handleSavePriority = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const isEdit = Boolean(priorityForm.id);
      const url = '/api/priorities';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(priorityForm),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar la prioridad.');
      }

      const saved = await res.json();

      if (isEdit) {
        setPriorities((prev) =>
          prev.map((item) => (item.id === saved.id ? { ...item, ...saved } : item))
        );
      } else {
        setPriorities((prev) => [...prev, saved]);
      }

      setIsPriorityModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePriority = async (id: string, title: string) => {
    if (!confirm(`¿Eliminar la prioridad "${title}"?`)) return;

    try {
      const res = await fetch(`/api/priorities?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setPriorities((prev) => prev.filter((p) => p.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar la prioridad.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al eliminar.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-rose-500">
              Enfoque Político Irrenunciable
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Objetivo, Público y Prioridades Políticas
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            El núcleo estratégico de {municipalityName} al que debe alinearse toda acción, tarea y mensaje de campaña.
          </p>
        </div>

        {/* Acciones principales */}
        {!readOnly ? (
          <div className="flex items-center gap-2.5 print:hidden">
            <button
              onClick={openEditStrategy}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs flex items-center gap-1.5 transition"
              title="Editar objetivo político, público diana y mensajes"
            >
              <Edit3 className="w-3.5 h-3.5 text-rose-500" />
              <span>Editar Estrategia</span>
            </button>

            <button
              onClick={openCreatePriority}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-2xs flex items-center gap-1.5 transition"
              title="Añadir una nueva prioridad política irrenunciable"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nueva Prioridad</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg border border-slate-200 shrink-0">
            <span>👁️ Modo Solo Lectura</span>
          </div>
        )}
      </div>

      {/* Objetivo Político y Público Prioritario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm border border-slate-800 space-y-2 relative group">
          {!readOnly && (
            <button
              onClick={openEditStrategy}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-slate-800"
              title="Modificar objetivo"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          <span className="text-xs uppercase font-bold text-rose-400 flex items-center gap-1.5">
            <Target className="w-4 h-4" />
            1. Objetivo Político Principal
          </span>
          <h2 className="text-xl font-black text-white leading-tight">
            {strategy.mainGoal}
          </h2>
          <p className="text-xs text-slate-400 pt-1">
            Toda decisión organizativa, económica y comunicativa debe evaluarse en función de si acerca o aleja este objetivo en {municipalityName}.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-2 relative group">
          {!readOnly && (
            <button
              onClick={openEditStrategy}
              className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 transition p-1 rounded-lg hover:bg-rose-50"
              title="Modificar público prioritario"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          <span className="text-xs uppercase font-bold text-slate-500 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600" />
            2. Público Prioritario (Segmento Diana)
          </span>
          <h2 className="text-base font-bold text-slate-800 leading-snug">
            {strategy.targetAudience}
          </h2>
          <p className="text-xs text-slate-500 pt-1">
            El colectivo social clave para decantar la mayoría de concejales en el pleno municipal.
          </p>
        </div>
      </div>

      {/* Las Prioridades Políticas */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-500" />
              Prioridades Políticas Irrenunciables
            </h2>
            <p className="text-xs text-slate-500">
              Ninguna campaña puede prometerlo todo; estas son las batallas programáticas y de gestión centrales.
            </p>
          </div>

          <button
            onClick={openCreatePriority}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 self-start sm:self-center"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir Prioridad</span>
          </button>
        </div>

        {priorities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500 space-y-3">
            <Target className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-sm text-slate-700">No hay prioridades registradas</p>
            <p className="text-xs text-slate-400">
              Define las 3 prioridades centrales de tu programa de gobierno.
            </p>
            <button
              onClick={openCreatePriority}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition shadow-2xs"
            >
              + Crear Primera Prioridad
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {priorities.map((p) => {
              const taskCount = p.actionTasks?.length || 0;

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        {p.orderNumber}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                          {taskCount} acciones
                        </span>
                        {!readOnly && (
                          <>
                            <button
                              onClick={() => openEditPriority(p)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Editar prioridad"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePriority(p.id, p.title)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Eliminar prioridad"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{p.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {p.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-xs">
                    <span className="font-bold text-slate-700 block text-[11px]">
                      Métrica o compromiso verificable:
                    </span>
                    <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                      {p.targetMetric || 'Compromiso de programa electoral.'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ideas Fuerza de Identidad y Posicionamiento */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-slate-900 text-base">Ideas Clave de Identidad de Candidatura</h2>
          </div>
          {!readOnly && (
            <button
              onClick={openEditStrategy}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar ideas</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
            <span className="font-bold text-slate-400 block text-[10px] uppercase">Idea 1</span>
            <p className="font-bold text-slate-800 text-xs leading-relaxed">{strategy.brandIdea1}</p>
          </div>
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
            <span className="font-bold text-slate-400 block text-[10px] uppercase">Idea 2</span>
            <p className="font-bold text-slate-800 text-xs leading-relaxed">{strategy.brandIdea2}</p>
          </div>
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
            <span className="font-bold text-slate-400 block text-[10px] uppercase">Idea 3</span>
            <p className="font-bold text-slate-800 text-xs leading-relaxed">{strategy.brandIdea3}</p>
          </div>
        </div>
      </div>

      {/* Disciplina de Mensaje */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-5 space-y-2 shadow-2xs relative group">
          {!readOnly && (
            <button
              onClick={openEditStrategy}
              className="absolute top-4 right-4 text-emerald-700 hover:text-emerald-900 p-1 rounded-lg hover:bg-emerald-100 transition"
              title="Editar mensajes"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3>Mensajes que Deben Repetirse Sistemáticamente</h3>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed bg-white/70 p-3.5 rounded-xl border border-emerald-100 whitespace-pre-line">
            {strategy.messagesToRepeat}
          </p>
        </div>

        <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-5 space-y-2 shadow-2xs relative group">
          {!readOnly && (
            <button
              onClick={openEditStrategy}
              className="absolute top-4 right-4 text-rose-700 hover:text-rose-900 p-1 rounded-lg hover:bg-rose-100 transition"
              title="Editar temas a evitar"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h3>Temas que Conviene Evitar</h3>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed bg-white/70 p-3.5 rounded-xl border border-rose-100 whitespace-pre-line">
            {strategy.topicsToAvoid}
          </p>
        </div>
      </div>

      {/* MODAL EDITAR ESTRATEGIA */}
      {isStrategyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-rose-500" />
                Editar Estrategia y Posicionamiento de Campaña
              </h3>
              <button
                onClick={() => setIsStrategyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveStrategy} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Objetivo Político Principal
                </label>
                <textarea
                  rows={2}
                  value={strategyForm.mainGoal}
                  onChange={(e) => setStrategyForm({ ...strategyForm, mainGoal: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  placeholder="Meta central de alcaldía y concejales..."
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Público Prioritario (Segmento Diana)
                </label>
                <textarea
                  rows={2}
                  value={strategyForm.targetAudience}
                  onChange={(e) => setStrategyForm({ ...strategyForm, targetAudience: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  placeholder="Familias trabajadoras, autónomos, juventud..."
                  required
                />
              </div>

              {/* Ideas Clave */}
              <div className="border-t border-slate-100 pt-3 space-y-3">
                <span className="font-bold text-slate-800 block text-xs">
                  Tres Ideas Clave de Identidad de Candidatura:
                </span>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Idea 1</label>
                  <input
                    type="text"
                    value={strategyForm.brandIdea1}
                    onChange={(e) => setStrategyForm({ ...strategyForm, brandIdea1: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Idea 2</label>
                  <input
                    type="text"
                    value={strategyForm.brandIdea2}
                    onChange={(e) => setStrategyForm({ ...strategyForm, brandIdea2: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Idea 3</label>
                  <input
                    type="text"
                    value={strategyForm.brandIdea3}
                    onChange={(e) => setStrategyForm({ ...strategyForm, brandIdea3: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Mensajes y Temas a evitar */}
              <div className="border-t border-slate-100 pt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-emerald-800 block mb-1">
                    Mensajes a Repetir Sistemáticamente
                  </label>
                  <textarea
                    rows={3}
                    value={strategyForm.messagesToRepeat}
                    onChange={(e) => setStrategyForm({ ...strategyForm, messagesToRepeat: e.target.value })}
                    className="w-full px-3 py-2 border border-emerald-200 rounded-xl bg-emerald-50/40 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-rose-800 block mb-1">
                    Temas que Conviene Evitar
                  </label>
                  <textarea
                    rows={3}
                    value={strategyForm.topicsToAvoid}
                    onChange={(e) => setStrategyForm({ ...strategyForm, topicsToAvoid: e.target.value })}
                    className="w-full px-3 py-2 border border-rose-200 rounded-xl bg-rose-50/40 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStrategyModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-2xs transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Estrategia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR PRIORIDAD */}
      {isPriorityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-500" />
                {editingPriority ? 'Editar Prioridad Política' : 'Nueva Prioridad Política'}
              </h3>
              <button
                onClick={() => setIsPriorityModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSavePriority} className="space-y-4 text-xs">
              <div className="flex gap-3">
                <div className="w-20">
                  <label className="font-bold text-slate-700 block mb-1">Orden</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={priorityForm.orderNumber}
                    onChange={(e) =>
                      setPriorityForm({ ...priorityForm, orderNumber: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full px-3 py-2 text-center border border-slate-200 rounded-xl bg-slate-50 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    required
                  />
                </div>

                <div className="flex-1">
                  <label className="font-bold text-slate-700 block mb-1">Título de la Prioridad</label>
                  <input
                    type="text"
                    value={priorityForm.title}
                    onChange={(e) => setPriorityForm({ ...priorityForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    placeholder="Ej: Empleo y dinamización del comercio local"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Descripción y Eje de Actuación</label>
                <textarea
                  rows={3}
                  value={priorityForm.description}
                  onChange={(e) => setPriorityForm({ ...priorityForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  placeholder="Detalla las medidas y propuestas centrales en torno a este pilar..."
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Métrica o Compromiso Verificable
                </label>
                <input
                  type="text"
                  value={priorityForm.targetMetric}
                  onChange={(e) => setPriorityForm({ ...priorityForm, targetMetric: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  placeholder="Ej: +15% ayudas a nuevos emprendedores, 100% cobertura médica..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPriorityModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-2xs transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : editingPriority ? 'Guardar Cambios' : 'Crear Prioridad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
