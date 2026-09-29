'use client';

import React, { useState } from 'react';
import { Pencil, Trash2, X, CheckCircle2, AlertCircle, Megaphone } from 'lucide-react';

interface DistrictOption {
  id: string;
  name: string;
}

interface PriorityOption {
  id: string;
  orderNumber: number;
  title: string;
}

interface TaskData {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  districtId?: string | null;
  priorityId?: string | null;
  dueDate: string | Date;
  targetAudience?: string | null;
  keyMessage?: string | null;
  status: string;
}

export default function TaskEditDeleteModal({
  task,
  districts = [],
  priorities = [],
  canManage = true,
  triggerClassName,
}: {
  task: TaskData;
  districts?: DistrictOption[];
  priorities?: PriorityOption[];
  canManage?: boolean;
  triggerClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const getInitialDueDate = () => {
    if (task.dueDate) {
      const d = new Date(task.dueDate);
      return !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    type: task.type || 'TASK',
    districtId: task.districtId || '',
    priorityId: task.priorityId || '',
    dueDate: getInitialDueDate(),
    targetAudience: task.targetAudience || '',
    keyMessage: task.keyMessage || '',
    status: task.status || 'PENDING',
  });

  const handleOpen = () => {
    setError('');
    setFormData({
      title: task.title,
      description: task.description || '',
      type: task.type || 'TASK',
      districtId: task.districtId || '',
      priorityId: task.priorityId || '',
      dueDate: getInitialDueDate(),
      targetAudience: task.targetAudience || '',
      keyMessage: task.keyMessage || '',
      status: task.status || 'PENDING',
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.dueDate) {
      setError('Por favor, indica al menos el título y la fecha prevista.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: task.id,
          ...formData,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al actualizar la acción.');
      } else {
        setIsOpen(false);
        window.location.reload();
      }
    } catch {
      setError('Error de conexión con el servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la acción "${task.title}"?`)) {
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const res = await fetch(`/api/tasks?id=${encodeURIComponent(task.id)}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al eliminar la acción.');
      } else {
        setIsOpen(false);
        window.location.reload();
      }
    } catch {
      setError('Error de conexión al eliminar.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!canManage) return null;

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={
          triggerClassName ||
          'p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition'
        }
        title="Editar o eliminar acción"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-red-600" />
                <span>Editar Acción de Campaña</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
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

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Título de la Acción *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Actividad</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="TASK">Tarea Operativa</option>
                    <option value="VISIT">Visita Vecinal / Barrio</option>
                    <option value="EVENT">Acto Público / Carpa</option>
                    <option value="MEETING">Reunión Sectorial</option>
                    <option value="MEDIA">Medios / Publicación</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fecha Prevista *</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Distrito Específico</label>
                  <select
                    value={formData.districtId}
                    onChange={(e) => setFormData({ ...formData, districtId: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Ámbito Municipal General</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Prioridad Política</label>
                  <select
                    value={formData.priorityId}
                    onChange={(e) => setFormData({ ...formData, priorityId: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Sin prioridad asignada</option>
                    {priorities.map((p) => (
                      <option key={p.id} value={p.id}>
                        P{p.orderNumber}: {p.title.slice(0, 25)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Estado de la Acción</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="PENDING">Pendiente</option>
                  <option value="IN_PROGRESS">En Curso</option>
                  <option value="COMPLETED">Completada</option>
                  <option value="BLOCKED">Bloqueada</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Público Objetivo</label>
                <input
                  type="text"
                  placeholder="Ej: Vecinos de la barriada, comerciantes..."
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mensaje Principal a Transmitir</label>
                <input
                  type="text"
                  placeholder="Ej: Compromiso directo de asfaltado e iluminación"
                  value={formData.keyMessage}
                  onChange={(e) => setFormData({ ...formData, keyMessage: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Descripción / Finalidad</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting || isSaving}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? 'Eliminando...' : 'Eliminar Acción'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || isDeleting}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
