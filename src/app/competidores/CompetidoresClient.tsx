'use client';

import React, { useState } from 'react';
import {
  Eye,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  Filter,
  Layers,
  Calendar,
} from 'lucide-react';

interface Party {
  id: string;
  name: string;
  acronym: string;
  colorHex: string;
  isOwnParty: boolean;
}

interface CompetitorLog {
  id: string;
  partyId: string;
  type: string;
  title: string;
  description: string;
  opportunityToDifferentiate: string | null;
  date: string | Date;
  party: Party;
}

const TYPE_CONFIG: Record<string, { label: string; badge: string }> = {
  STATEMENT: { label: 'Declaración Pública', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  PROPOSAL: { label: 'Propuesta / Promesa', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  EVENT: { label: 'Acto / Calle', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
  ATTACK: { label: 'Ataque a Nuestra Lista', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  ALLIANCE: { label: 'Alianza / Pacto', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  BLUNDER: { label: 'Error / Patinazo', badge: 'bg-red-50 text-red-700 border-red-200' },
  CANDIDATE_CHANGE: { label: 'Cambio de Candidato', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
};

export default function CompetidoresClient({
  initialLogs,
  parties,
  municipality,
  readOnly = false,
}: {
  initialLogs: CompetitorLog[];
  parties: Party[];
  municipality: string;
  readOnly?: boolean;
}) {
  const [logs, setLogs] = useState<CompetitorLog[]>(initialLogs);
  const [filterParty, setFilterParty] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<CompetitorLog | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  // Default candidate parties are rival parties (or all if only own exists)
  const rivalParties = parties.filter((p) => !p.isOwnParty);
  const availableParties = rivalParties.length > 0 ? rivalParties : parties;

  const [formData, setFormData] = useState({
    partyId: availableParties[0]?.id || '',
    type: 'STATEMENT',
    title: '',
    description: '',
    opportunityToDifferentiate: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleOpenCreate = () => {
    setEditingLog(null);
    setError('');
    setFormData({
      partyId: availableParties[0]?.id || '',
      type: 'STATEMENT',
      title: '',
      description: '',
      opportunityToDifferentiate: '',
      date: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (log: CompetitorLog) => {
    setEditingLog(log);
    setError('');
    const d = new Date(log.date);
    setFormData({
      partyId: log.partyId,
      type: log.type,
      title: log.title,
      description: log.description,
      opportunityToDifferentiate: log.opportunityToDifferentiate || '',
      date: !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.partyId || !formData.title.trim() || !formData.description.trim()) {
      setError('Por favor, selecciona un partido e introduce título y descripción.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      if (editingLog) {
        // Edit PUT
        const res = await fetch('/api/competitors', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingLog.id,
            ...formData,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Error al actualizar el movimiento.');
          return;
        }

        const updated = await res.json();
        setLogs((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      } else {
        // Create POST
        const res = await fetch('/api/competitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Error al registrar el movimiento.');
          return;
        }

        const created = await res.json();
        setLogs((prev) => [created, ...prev]);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setError('Error de conexión con el servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este movimiento del radar de competidores?')) {
      return;
    }

    setIsDeletingId(id);
    try {
      const res = await fetch(`/api/competitors?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setLogs((prev) => prev.filter((l) => l.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar el registro.');
      }
    } catch (err) {
      alert('Error de conexión al eliminar.');
    } finally {
      setIsDeletingId(null);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filterParty !== 'ALL' && log.partyId !== filterParty) return false;
    if (filterType !== 'ALL' && log.type !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-red-600">
              Inteligencia Política
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Radar y Seguimiento de Competidores</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitorización de declaraciones, movimientos, errores públicos y ventanas de oportunidad en {municipality}.
          </p>
        </div>

        {!readOnly ? (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nuevo Movimiento de Rival
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg border border-slate-200 shrink-0">
            <span>👁️ Modo Solo Lectura</span>
          </div>
        )}
      </div>

      {/* Filters Bar */}
      {logs.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mr-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filtrar por:</span>
          </div>

          <select
            value={filterParty}
            onChange={(e) => setFilterParty(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="ALL">Todos los partidos rivales ({logs.length})</option>
            {parties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.acronym} - {p.name}
              </option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="ALL">Todos los tipos de movimiento</option>
            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.label}
              </option>
            ))}
          </select>

          {(filterParty !== 'ALL' || filterType !== 'ALL') && (
            <button
              onClick={() => {
                setFilterParty('ALL');
                setFilterType('ALL');
              }}
              className="text-xs text-red-600 hover:text-red-700 font-semibold underline ml-auto"
            >
              Restablecer filtros
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {logs.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center space-y-4">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Eye className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-bold text-slate-800 text-base">No hay movimientos de rivales registrados</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Registra declaraciones públicas, actos de precampaña, propuestas o errores de los partidos competidores en{' '}
              {municipality} para no perder oportunidades de contraste.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Registrar Primer Movimiento de Rival
          </button>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
          No hay movimientos que coincidan con los filtros seleccionados.
        </div>
      ) : (
        /* Logs List */
        <div className="space-y-4">
          {filteredLogs.map((log) => {
            const typeInfo = TYPE_CONFIG[log.type] || {
              label: log.type,
              badge: 'bg-slate-100 text-slate-700 border-slate-200',
            };

            return (
              <div
                key={log.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="px-2.5 py-0.5 rounded text-xs font-black text-white shadow-2xs"
                      style={{ backgroundColor: log.party?.colorHex || '#64748b' }}
                    >
                      {log.party?.acronym || 'Rival'}
                    </span>
                    <span className="text-xs font-bold text-slate-700">{log.party?.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${typeInfo.badge}`}
                    >
                      {typeInfo.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(log.date).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>

                    {!readOnly && (
                      <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-3">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(log)}
                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                          title="Editar movimiento"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(log.id)}
                          disabled={isDeletingId === log.id}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-50"
                          title="Eliminar movimiento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{log.title}</h3>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                  {log.description}
                </p>

                {log.opportunityToDifferentiate && (
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs space-y-1">
                    <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                      Oportunidad de Diferenciación para Nuestra Candidatura:
                    </span>
                    <p className="text-slate-800 font-medium pl-5">{log.opportunityToDifferentiate}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Crear / Editar Movimiento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Eye className="w-5 h-5 text-red-600" />
                <span>{editingLog ? 'Editar Movimiento de Rival' : 'Registrar Nuevo Movimiento de Rival'}</span>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Partido Rival *</label>
                  <select
                    value={formData.partyId}
                    onChange={(e) => setFormData({ ...formData, partyId: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {availableParties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.acronym} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Movimiento *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>
                        {cfg.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Fecha del Suceso *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Título del Movimiento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Rueda de prensa prometiendo aparcamientos o error en cifras de presupuestos"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Descripción y Hechos *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="¿Qué han dicho, anunciado o hecho exactamente? Cita o describe el hecho."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="font-bold text-emerald-800 block mb-1">
                  Oportunidad de Diferenciación para Nuestra Lista (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="¿Cómo podemos aprovechar esto? Ej: Contrastar su falta de rigor con nuestra propuesta realista."
                  value={formData.opportunityToDifferentiate}
                  onChange={(e) => setFormData({ ...formData, opportunityToDifferentiate: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-emerald-300 bg-emerald-50/40 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  <span>{isSaving ? 'Guardando...' : editingLog ? 'Guardar Cambios' : 'Registrar Movimiento'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
