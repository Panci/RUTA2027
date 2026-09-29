'use client';

import React, { useState } from 'react';
import {
  Users,
  Shield,
  Award,
  AlertCircle,
  Plus,
  Layers,
  UserCheck,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
} from 'lucide-react';

interface Party {
  id: string;
  name: string;
  acronym: string;
  colorHex: string;
  isOwnParty: boolean;
  coalition?: string | null;
  candidateName?: string | null;
  concejales2023: number;
  votes2023: number;
  percent2023: number;
  mainTopics?: string | null;
  strengths?: string | null;
  weaknesses?: string | null;
  potentialAlliances?: string | null;
}

export default function PartidosClient({
  initialParties,
  municipality,
  readOnly = false,
}: {
  initialParties: Party[];
  municipality: string;
  readOnly?: boolean;
}) {
  const [parties, setParties] = useState<Party[]>(initialParties);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    acronym: '',
    colorHex: '#64748b',
    isOwnParty: false,
    candidateName: '',
    concejales2023: 0,
    votes2023: 0,
    percent2023: 0,
    mainTopics: '',
    strengths: '',
    weaknesses: '',
    potentialAlliances: '',
  });

  const handleOpenCreate = () => {
    setEditingParty(null);
    setError('');
    setFormData({
      name: '',
      acronym: '',
      colorHex: '#64748b',
      isOwnParty: false,
      candidateName: '',
      concejales2023: 0,
      votes2023: 0,
      percent2023: 0,
      mainTopics: '',
      strengths: '',
      weaknesses: '',
      potentialAlliances: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (party: Party) => {
    setEditingParty(party);
    setError('');
    setFormData({
      name: party.name,
      acronym: party.acronym,
      colorHex: party.colorHex || '#64748b',
      isOwnParty: party.isOwnParty,
      candidateName: party.candidateName || '',
      concejales2023: party.concejales2023,
      votes2023: party.votes2023,
      percent2023: party.percent2023,
      mainTopics: party.mainTopics || '',
      strengths: party.strengths || '',
      weaknesses: party.weaknesses || '',
      potentialAlliances: party.potentialAlliances || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.acronym.trim()) {
      setError('Por favor, indica al menos el nombre y las siglas de la candidatura.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      if (editingParty) {
        // PUT
        const res = await fetch('/api/parties', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingParty.id,
            ...formData,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Error al actualizar la candidatura.');
          return;
        }

        const updated = await res.json();
        setParties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        // POST
        const res = await fetch('/api/parties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Error al crear la candidatura.');
          return;
        }

        const created = await res.json();
        setParties((prev) => [...prev, created]);
      }

      setIsModalOpen(false);
    } catch {
      setError('Error de conexión con el servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta candidatura de la campaña?')) {
      return;
    }

    setIsDeletingId(id);
    try {
      const res = await fetch(`/api/parties?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setParties((prev) => prev.filter((p) => p.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar la candidatura.');
      }
    } catch {
      alert('Error de conexión al eliminar.');
    } finally {
      setIsDeletingId(null);
    }
  };

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
            Seguimiento de candidaturas concurrentes, alianzas previstas y diferenciación entre datos e hipótesis en {municipality}.
          </p>
        </div>

        {!readOnly ? (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nueva Candidatura / Partido
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg border border-slate-200 shrink-0">
            <span>👁️ Modo Solo Lectura</span>
          </div>
        )}
      </div>

      {/* Explicación de Categorías Epistemológicas */}
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
        {parties.map((p) => {
          return (
            <div
              key={p.id}
              className={`bg-white rounded-xl border p-5 shadow-sm space-y-4 hover:border-slate-300 transition ${
                p.isOwnParty ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-white text-sm shadow-sm shrink-0"
                    style={{ backgroundColor: p.colorHex || '#64748b' }}
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
                      Candidato/a: <strong>{p.candidateName || 'Por definir públicamente'}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-lg font-black text-slate-800">{p.concejales2023}</span>
                    <span className="text-[11px] text-slate-500 block leading-none">concejales 2023</span>
                  </div>

                  {!readOnly && (
                    <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                        title="Editar ficha política"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {!p.isOwnParty && (
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          disabled={isDeletingId === p.id}
                          className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-50"
                          title="Eliminar candidatura"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 1. Datos Confirmados */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-1 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-emerald-800 flex items-center gap-1">
                    📊 Dato Electoral 2023
                  </span>
                  <span className="text-slate-500 font-semibold">
                    {p.votes2023.toLocaleString()} votos ({p.percent2023}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.min(100, p.percent2023 * 2)}%`, backgroundColor: p.colorHex || '#64748b' }}
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

      {/* Modal Crear / Editar Partido */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-red-600" />
                <span>{editingParty ? `Editar Ficha: ${editingParty.name}` : 'Registrar Nueva Candidatura'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Nombre Completo del Partido *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Partido Socialista Obrero Español"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Siglas *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: PSOE-A"
                    value={formData.acronym}
                    onChange={(e) => setFormData({ ...formData, acronym: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-bold text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Color Distintivo</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.colorHex}
                      onChange={(e) => setFormData({ ...formData, colorHex: e.target.value })}
                      className="w-10 h-10 p-1 rounded-lg border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.colorHex}
                      onChange={(e) => setFormData({ ...formData, colorHex: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-300 font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Nombre del Candidato/a</label>
                  <input
                    type="text"
                    placeholder="Ej: María José Fernández"
                    value={formData.candidateName}
                    onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Concejales 2023</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.concejales2023}
                    onChange={(e) => setFormData({ ...formData, concejales2023: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 rounded-lg border border-slate-300 font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Votos 2023</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.votes2023}
                    onChange={(e) => setFormData({ ...formData, votes2023: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 rounded-lg border border-slate-300 font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">% Voto 2023</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={100}
                    value={formData.percent2023}
                    onChange={(e) => setFormData({ ...formData, percent2023: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 rounded-lg border border-slate-300 font-bold bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-blue-700 block mb-1">
                  📢 Temas y Mensajes Públicos Principales
                </label>
                <textarea
                  rows={2}
                  placeholder="¿De qué hablan en sus ruedas de prensa y redes? Principales ejes..."
                  value={formData.mainTopics}
                  onChange={(e) => setFormData({ ...formData, mainTopics: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-blue-200 bg-blue-50/30 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">💪 Fortalezas Principales</label>
                  <textarea
                    rows={2}
                    placeholder="Puntos fuertes de esta candidatura..."
                    value={formData.strengths}
                    onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">⚠️ Debilidades / Flancos Débiles</label>
                  <textarea
                    rows={2}
                    placeholder="Vulnerabilidades, contradicciones o rechazo..."
                    value={formData.weaknesses}
                    onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-purple-700 block mb-1">
                  🔮 Hipótesis de Pactos / Alianzas 2027
                </label>
                <textarea
                  rows={2}
                  placeholder="¿Con quién podrían pactar para gobernar? ¿Qué escenarios se abren?"
                  value={formData.potentialAlliances}
                  onChange={(e) => setFormData({ ...formData, potentialAlliances: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-purple-200 bg-purple-50/30 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSaving ? 'Guardando...' : editingParty ? 'Guardar Cambios' : 'Crear Candidatura'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
