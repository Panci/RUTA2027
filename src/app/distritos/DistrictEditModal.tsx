'use client';

import React, { useState } from 'react';
import { Pencil, X, CheckCircle2, AlertCircle, MapPin } from 'lucide-react';

interface DistrictProps {
  id: string;
  name: string;
  code: string;
  strategicGoal?: string | null;
  mainIssues?: string | null;
  targetAudience?: string | null;
}

export default function DistrictEditModal({
  district,
  canManage = true,
}: {
  district: DistrictProps;
  canManage?: boolean;
}) {
  if (!canManage) return null;
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: district.name,
    strategicGoal: district.strategicGoal || '',
    mainIssues: district.mainIssues || '',
    targetAudience: district.targetAudience || '',
  });

  const handleOpen = () => {
    setError('');
    setFormData({
      name: district.name,
      strategicGoal: district.strategicGoal || '',
      mainIssues: district.mainIssues || '',
      targetAudience: district.targetAudience || '',
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const res = await fetch('/api/districts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: district.id,
          ...formData,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al guardar la información del distrito.');
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

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
        title="Editar ficha estratégica de distrito"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                <span>Editar Ficha Estratégica: {district.name}</span>
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

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre del Distrito</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Objetivo Estratégico en el Distrito</label>
                <textarea
                  rows={2}
                  placeholder="Ej: Consolidar primera fuerza aumentando 150 votos frente al rival"
                  value={formData.strategicGoal}
                  onChange={(e) => setFormData({ ...formData, strategicGoal: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Problemas Principales Percibidos</label>
                <textarea
                  rows={3}
                  placeholder="Ej: Falta de aparcamiento, deficiente iluminación y ruidos nocturnos"
                  value={formData.mainIssues}
                  onChange={(e) => setFormData({ ...formData, mainIssues: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Público Prioritario en el Distrito</label>
                <input
                  type="text"
                  placeholder="Ej: Familias de mediana edad, autónomos locales, mayores de 65..."
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
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
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
