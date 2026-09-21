'use client';

import React, { useState } from 'react';
import { Plus, X, Check, Megaphone, Calendar, MapPin, Target } from 'lucide-react';

interface DistrictOption {
  id: string;
  name: string;
}

interface PriorityOption {
  id: string;
  orderNumber: number;
  title: string;
}

export default function TaskCreatorModal({
  districts,
  priorities,
}: {
  districts: DistrictOption[];
  priorities: PriorityOption[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'TASK',
    districtId: '',
    priorityId: '',
    dueDate: new Date().toISOString().split('T')[0],
    targetAudience: '',
    keyMessage: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.dueDate) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsOpen(false);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow transition flex items-center gap-1.5"
      >
        <Plus className="w-4 h-4" />
        Nueva Acción / Tarea
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-red-600" />
                Registrar Nueva Acción de Campaña
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Título de la Acción / Tarea *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Visita a la asociación de vecinos del Ensanche"
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
                    <option value="TASK" className="text-slate-900 bg-white">Tarea Operativa</option>
                    <option value="VISIT" className="text-slate-900 bg-white">Visita Vecinal / Barrio</option>
                    <option value="EVENT" className="text-slate-900 bg-white">Acto Público / Carpa</option>
                    <option value="MEETING" className="text-slate-900 bg-white">Reunión Sectorial</option>
                    <option value="MEDIA" className="text-slate-900 bg-white">Medios / Publicación</option>
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
                    <option value="" className="text-slate-900 bg-white">Ámbito Municipal General</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id} className="text-slate-900 bg-white">
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
                    <option value="" className="text-slate-900 bg-white">Sin prioridad asignada</option>
                    {priorities.map((p) => (
                      <option key={p.id} value={p.id} className="text-slate-900 bg-white">
                        P{p.orderNumber}: {p.title.slice(0, 25)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Público Objetivo al que se Dirige</label>
                <input
                  type="text"
                  placeholder="Ej: Familias jóvenes, pensionistas, comerciantes..."
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mensaje Principal a Transmitir</label>
                <input
                  type="text"
                  placeholder="Ej: Inversión garantizada en limpieza e iluminación"
                  value={formData.keyMessage}
                  onChange={(e) => setFormData({ ...formData, keyMessage: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Descripción / Finalidad</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre qué se busca conseguir..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-lg transition shadow"
                >
                  {isSaving ? 'Guardando...' : 'Crear Acción'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
