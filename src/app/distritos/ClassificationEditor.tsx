'use client';

import React, { useState } from 'react';
import { Check, Edit2 } from 'lucide-react';

const CLASSIFICATIONS = [
  { value: 'FORTALEZA', label: '🛡️ Fortaleza propia', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 'CRECIMIENTO', label: '📈 Crecimiento prioritario', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'DEFENSA', label: '🏰 Defensa', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { value: 'OPORTUNIDAD', label: '💡 Oportunidad', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { value: 'COMPETENCIA_ABIERTA', label: '⚔️ Competencia abierta', color: 'bg-slate-100 text-slate-800 border-slate-300' },
  { value: 'BAJA_PARTICIPACION', label: '💤 Baja participación', color: 'bg-red-100 text-red-800 border-red-300' },
  { value: 'PRIORIDAD_TERRITORIAL', label: '🎯 Prioridad territorial', color: 'bg-rose-100 text-rose-800 border-rose-300' },
];

export default function ClassificationEditor({
  districtId,
  initialClassification,
}: {
  districtId: string;
  initialClassification: string;
}) {
  const [current, setCurrent] = useState(initialClassification);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = async (newVal: string) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/district-classification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ districtId, classification: newVal }),
      });
      if (res.ok) {
        setCurrent(newVal);
        setIsEditing(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const currentOption = CLASSIFICATIONS.find((c) => c.value === current) || CLASSIFICATIONS[4];

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className={`text-xs px-2.5 py-1 rounded-full font-bold border flex items-center gap-1.5 transition hover:opacity-80 ${currentOption.color}`}
        title="Haz clic para modificar la clasificación estratégica"
      >
        <span>{currentOption.label}</span>
        <Edit2 className="w-3 h-3 opacity-60" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <select
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isSaving}
        className="text-xs p-1 rounded border border-slate-300 bg-white font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500"
      >
        {CLASSIFICATIONS.map((opt) => (
          <option key={opt.value} value={opt.value} className="text-slate-900 bg-white">
            {opt.label}
          </option>
        ))}
      </select>
      <button
        onClick={() => setIsEditing(false)}
        className="text-[11px] text-slate-500 hover:text-slate-800 px-1"
      >
        ✕
      </button>
    </div>
  );
}
