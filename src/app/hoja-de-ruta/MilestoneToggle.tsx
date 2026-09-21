'use client';

import React, { useState } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

export default function MilestoneToggle({
  milestoneId,
  initialCompleted,
  title,
  readOnly = false,
}: {
  milestoneId: string;
  initialCompleted: boolean;
  title: string;
  readOnly?: boolean;
}) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    if (readOnly) return;
    const nextState = !isCompleted;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/milestones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: milestoneId, isCompleted: nextState }),
      });
      if (res.ok) {
        setIsCompleted(nextState);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isUpdating || readOnly}
      className={`flex items-center gap-2 text-left transition ${
        readOnly ? 'cursor-default opacity-85' : 'hover:opacity-80 cursor-pointer'
      }`}
      title={readOnly ? 'Hito de campaña (Solo Lectura)' : 'Haz clic para marcar como completado/pendiente'}
    >
      {isCompleted ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
      ) : (
        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
      )}
      <span className={isCompleted ? 'line-through text-slate-400 text-xs' : 'font-medium text-slate-800 text-xs'}>
        {title}
      </span>
    </button>
  );
}
