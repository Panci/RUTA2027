'use client';

import React, { useState } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

export default function MilestoneToggle({
  milestoneId,
  initialCompleted,
  title,
}: {
  milestoneId: string;
  initialCompleted: boolean;
  title: string;
}) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
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
      disabled={isUpdating}
      className="flex items-center gap-2 text-left hover:opacity-80 transition cursor-pointer"
      title="Haz clic para marcar como completado/pendiente"
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
