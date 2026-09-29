'use client';

import React, { useState } from 'react';
import {
  Milestone,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface MilestoneData {
  id: string;
  phaseId: string;
  title: string;
  dueDate: string | Date;
  isCompleted: boolean;
}

interface PhaseData {
  id: string;
  phaseNumber: number;
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  objectives: string | null;
  indicators: string | null;
  risks: string | null;
  status: string;
  milestones: MilestoneData[];
}

export default function HojaDeRutaClient({
  phases: initialPhases,
  canManage = true,
}: {
  phases: PhaseData[];
  canManage?: boolean;
}) {
  const [phases, setPhases] = useState<PhaseData[]>(initialPhases);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<MilestoneData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    phaseId: phases[0]?.id || '',
    title: '',
    dueDate: new Date().toISOString().split('T')[0],
  });

  const handleOpenCreate = (phaseId: string) => {
    setEditingMilestone(null);
    setError('');
    setFormData({
      phaseId,
      title: '',
      dueDate: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: MilestoneData) => {
    setEditingMilestone(m);
    setError('');
    const d = new Date(m.dueDate);
    setFormData({
      phaseId: m.phaseId,
      title: m.title,
      dueDate: !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleToggle = async (milestone: MilestoneData) => {
    if (!canManage) return;
    const nextCompleted = !milestone.isCompleted;

    // Optimistic UI update
    setPhases((prev) =>
      prev.map((phase) => ({
        ...phase,
        milestones: phase.milestones.map((m) =>
          m.id === milestone.id ? { ...m, isCompleted: nextCompleted } : m
        ),
      }))
    );

    try {
      const res = await fetch('/api/milestones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: milestone.id, isCompleted: nextCompleted }),
      });

      if (!res.ok) {
        // Rollback on failure
        setPhases((prev) =>
          prev.map((phase) => ({
            ...phase,
            milestones: phase.milestones.map((m) =>
              m.id === milestone.id ? { ...m, isCompleted: milestone.isCompleted } : m
            ),
          }))
        );
      }
    } catch {
      // Rollback
      setPhases((prev) =>
        prev.map((phase) => ({
          ...phase,
          milestones: phase.milestones.map((m) =>
            m.id === milestone.id ? { ...m, isCompleted: milestone.isCompleted } : m
          ),
        }))
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.dueDate || !formData.phaseId) {
      setError('Por favor, completa el título y la fecha.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      if (editingMilestone) {
        // PUT
        const res = await fetch('/api/milestones', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingMilestone.id,
            phaseId: formData.phaseId,
            title: formData.title,
            dueDate: formData.dueDate,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Error al actualizar el hito.');
          return;
        }

        const updated = await res.json();
        setPhases((prev) =>
          prev.map((phase) => {
            // Remove from previous phase if moved
            const cleanedMilestones = phase.milestones.filter((m) => m.id !== updated.id);
            if (phase.id === updated.phaseId) {
              return { ...phase, milestones: [...cleanedMilestones, updated] };
            }
            return { ...phase, milestones: cleanedMilestones };
          })
        );
      } else {
        // POST
        const res = await fetch('/api/milestones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Error al crear el hito.');
          return;
        }

        const created = await res.json();
        setPhases((prev) =>
          prev.map((phase) =>
            phase.id === created.phaseId
              ? { ...phase, milestones: [...phase.milestones, created] }
              : phase
          )
        );
      }

      setIsModalOpen(false);
    } catch {
      setError('Error de conexión con el servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, phaseId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este hito de la hoja de ruta?')) {
      return;
    }

    setIsDeletingId(id);
    try {
      const res = await fetch(`/api/milestones?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setPhases((prev) =>
          prev.map((phase) =>
            phase.id === phaseId
              ? { ...phase, milestones: phase.milestones.filter((m) => m.id !== id) }
              : phase
          )
        );
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar el hito.');
      }
    } catch {
      alert('Error de conexión al eliminar.');
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Timeline de las 7 Fases */}
      <div className="space-y-5">
        {phases.map((phase) => {
          const isCurrent = phase.status === 'IN_PROGRESS';
          const isCompleted = phase.status === 'COMPLETED';

          const completedCount = phase.milestones.filter((m) => m.isCompleted).length;
          const totalCount = phase.milestones.length;

          return (
            <div
              key={phase.id}
              className={`bg-white rounded-xl border p-5 shadow-sm transition ${
                isCurrent
                  ? 'border-red-500 ring-2 ring-red-500/10'
                  : isCompleted
                  ? 'border-emerald-300'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shadow-xs ${
                      isCurrent
                        ? 'bg-red-600 text-white'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {phase.phaseNumber}
                  </span>
                  <div>
                    <h2 className="font-bold text-slate-900 text-base">{phase.name}</h2>
                    <span className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(phase.startDate).toLocaleDateString('es-ES', {
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      —{' '}
                      {new Date(phase.endDate).toLocaleDateString('es-ES', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {completedCount} / {totalCount} hitos cumplidos
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isCurrent
                        ? 'bg-red-100 text-red-700'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isCurrent ? 'Fase Activa' : isCompleted ? 'Completada' : 'Planificada'}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                <div>
                  <span className="font-semibold text-slate-500 block mb-1.5">Objetivo Central de Fase:</span>
                  <p className="text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200/80 leading-relaxed font-medium">
                    {phase.objectives || 'Sin objetivos especificados.'}
                  </p>
                </div>

                <div className="md:col-span-2 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-600 block">
                      Hitos Clave ({phase.milestones.length}):
                    </span>
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => handleOpenCreate(phase.id)}
                        className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Añadir Hito
                      </button>
                    )}
                  </div>

                  {phase.milestones.length === 0 ? (
                    <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center space-y-2">
                      <p className="text-slate-400 italic">No hay hitos programados en esta fase todavía.</p>
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => handleOpenCreate(phase.id)}
                          className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-slate-700 font-bold text-[11px] inline-flex items-center gap-1 transition"
                        >
                          <Plus className="w-3 h-3 text-red-600" />
                          Crear primer hito
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {phase.milestones.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-slate-300 transition gap-2"
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <button
                              type="button"
                              disabled={!canManage}
                              onClick={() => handleToggle(m)}
                              className={`shrink-0 transition ${
                                !canManage
                                  ? 'cursor-default opacity-80'
                                  : 'text-slate-400 hover:text-emerald-600 cursor-pointer'
                              }`}
                              title={
                                !canManage
                                  ? 'Modo Solo Lectura'
                                  : m.isCompleted
                                  ? 'Desmarcar'
                                  : 'Marcar como completado'
                              }
                            >
                              {m.isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-300 hover:text-emerald-500" />
                              )}
                            </button>
                            <span
                              className={`truncate font-medium text-xs ${
                                m.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                              }`}
                            >
                              {m.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] text-slate-500 font-medium bg-white px-2 py-0.5 rounded border border-slate-200">
                              {new Date(m.dueDate).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                              })}
                            </span>

                            {canManage && (
                              <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(m)}
                                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition"
                                  title="Editar hito"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(m.id, phase.id)}
                                  disabled={isDeletingId === m.id}
                                  className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded transition disabled:opacity-50"
                                  title="Eliminar hito"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Crear / Editar Hito */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Milestone className="w-5 h-5 text-red-600" />
                <span>{editingMilestone ? 'Editar Hito de Campaña' : 'Añadir Hito a la Hoja de Ruta'}</span>
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
              <div>
                <label className="font-bold text-slate-700 block mb-1">Fase del Cronograma *</label>
                <select
                  value={formData.phaseId}
                  onChange={(e) => setFormData({ ...formData, phaseId: e.target.value })}
                  required
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {phases.map((p) => (
                    <option key={p.id} value={p.id}>
                      Fase {p.phaseNumber}: {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Título del Hito *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Cierre de la lista de apoderados o Presentación oficial del programa"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Fecha Límite Prevista *</label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
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
                  <span>{isSaving ? 'Guardando...' : editingMilestone ? 'Guardar Cambios' : 'Añadir Hito'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
