'use client';

import React, { useState } from 'react';
import { Plus, Pencil, X, Calendar, AlertCircle, Trash2, CheckCircle2, Eye } from 'lucide-react';

interface MeetingData {
  id?: string;
  meetingDate: string | Date;
  agenda: string;
  decisionsTaken: string;
  roadblocks?: string | null;
  risksDetected?: string | null;
  priorityChanges?: string | null;
}

export default function MeetingModal({
  meeting,
  canManage = true,
  triggerText,
  triggerClassName,
}: {
  meeting?: MeetingData | null;
  canManage?: boolean;
  triggerText?: string;
  triggerClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const isEdit = Boolean(meeting?.id);

  const getInitialDate = () => {
    if (meeting?.meetingDate) {
      const d = new Date(meeting.meetingDate);
      return d.toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    meetingDate: getInitialDate(),
    agenda: meeting?.agenda || '',
    decisionsTaken: meeting?.decisionsTaken || '',
    roadblocks: meeting?.roadblocks || '',
    risksDetected: meeting?.risksDetected || '',
    priorityChanges: meeting?.priorityChanges || '',
  });

  const handleOpen = () => {
    setError('');
    setFormData({
      meetingDate: getInitialDate(),
      agenda: meeting?.agenda || '',
      decisionsTaken: meeting?.decisionsTaken || '',
      roadblocks: meeting?.roadblocks || '',
      risksDetected: meeting?.risksDetected || '',
      priorityChanges: meeting?.priorityChanges || '',
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.meetingDate || !formData.agenda || !formData.decisionsTaken) {
      setError('Por favor, completa la fecha, el orden del día y las decisiones tomadas.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const url = '/api/meetings';
      const method = isEdit ? 'PATCH' : 'POST';
      const payload = isEdit ? { ...formData, id: meeting!.id } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al guardar el acta.');
      } else {
        setIsOpen(false);
        window.location.reload();
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit || !meeting?.id) return;
    if (!confirm('¿Estás seguro de que deseas eliminar esta acta de reunión? Esta acción no se puede deshacer.')) {
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const res = await fetch(`/api/meetings?id=${encodeURIComponent(meeting.id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al eliminar el acta.');
      } else {
        setIsOpen(false);
        window.location.reload();
      }
    } catch (err) {
      setError('Error de conexión al eliminar.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!canManage && !isEdit) {
    return null;
  }

  return (
    <>
      {isEdit ? (
        <button
          type="button"
          onClick={handleOpen}
          className={
            triggerClassName ||
            'px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition flex items-center gap-1.5'
          }
        >
          {canManage ? (
            <Pencil className="w-3.5 h-3.5 text-slate-600" />
          ) : (
            <Eye className="w-3.5 h-3.5 text-blue-600" />
          )}
          <span>{triggerText || (canManage ? 'Editar Acta' : 'Ver Acta')}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className={
            triggerClassName ||
            'px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition flex items-center gap-1.5'
          }
        >
          <Plus className="w-4 h-4" />
          <span>{triggerText || 'Nueva Reunión de Comité'}</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Cabecera del modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-slate-800 text-base">
                  {isEdit ? 'Editar Acta de Reunión del Comité' : 'Registrar Nueva Reunión del Comité'}
                </h3>
              </div>
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

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Fecha de la reunión */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Fecha de la Reunión *
                </label>
                <input
                  type="date"
                  required
                  value={formData.meetingDate}
                  onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                />
              </div>

              {/* 1. Orden del Día */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  1. Orden del Día Tratado *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.agenda}
                  onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                  placeholder="Ej: 1. Repaso de hitos fase 1. 2. Balance del acto en Distrito 2. 3. Asignación de tareas semanales."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                />
              </div>

              {/* 2. Decisiones y Acuerdos */}
              <div>
                <label className="font-bold text-emerald-800 block mb-1">
                  2. Decisiones y Acuerdos Tomados *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.decisionsTaken}
                  onChange={(e) => setFormData({ ...formData, decisionsTaken: e.target.value })}
                  placeholder="Ej: Se aprueba concentrar la presencia del candidato 2 tardes a la semana en el Ensanche (Distrito 2)."
                  className="w-full p-2.5 bg-emerald-50/40 border border-emerald-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-medium"
                />
              </div>

              {/* 3. Bloqueos Identificados */}
              <div>
                <label className="font-bold text-amber-800 block mb-1">
                  3. Bloqueos Identificados (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={formData.roadblocks}
                  onChange={(e) => setFormData({ ...formData, roadblocks: e.target.value })}
                  placeholder="Ej: Retraso en la entrega de material impreso de la sede."
                  className="w-full p-2.5 bg-amber-50/40 border border-amber-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              {/* 4. Riesgos Nuevos Detectados */}
              <div>
                <label className="font-bold text-rose-800 block mb-1">
                  4. Riesgos Nuevos Detectados (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={formData.risksDetected}
                  onChange={(e) => setFormData({ ...formData, risksDetected: e.target.value })}
                  placeholder="Ej: Posible anuncio de rebajas de IBI por el ayuntamiento antes de noviembre."
                  className="w-full p-2.5 bg-rose-50/40 border border-rose-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {!canManage ? (
                  <>
                    <div />
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition"
                    >
                      Cerrar
                    </button>
                  </>
                ) : (
                  <>
                    {isEdit ? (
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting || isSaving}
                        className="px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isDeleting ? 'Eliminando...' : 'Eliminar Acta'}</span>
                      </button>
                    ) : (
                      <div />
                    )}

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
                        <span>{isSaving ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Registrar Acta'}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
