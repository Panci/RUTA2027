'use client';

import React, { useState } from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function TaskStatusToggle({
  taskId,
  initialStatus,
  disabled = false,
}: {
  taskId: string;
  initialStatus: string;
  disabled?: boolean;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const nextStatus = () => {
    if (status === 'PENDING') return 'IN_PROGRESS';
    if (status === 'IN_PROGRESS') return 'COMPLETED';
    return 'PENDING';
  };

  const handleToggle = async () => {
    if (disabled) return;
    const target = nextStatus();
    setIsUpdating(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: target }),
      });
      if (res.ok) {
        setStatus(target);
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
      className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full transition flex items-center gap-1 border ${
        disabled ? 'cursor-default opacity-85' : 'cursor-pointer hover:opacity-80'
      } ${
        status === 'COMPLETED'
          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
          : status === 'IN_PROGRESS'
          ? 'bg-amber-100 text-amber-800 border-amber-300'
          : 'bg-slate-100 text-slate-700 border-slate-300'
      }`}
      title={disabled ? 'Modo Solo Lectura (Supervisor)' : 'Haz clic para cambiar estado (Pendiente → En curso → Completada)'}
    >
      {status === 'COMPLETED' ? (
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
      ) : (
        <Clock className="w-3 h-3 text-slate-500" />
      )}
      <span>{status === 'COMPLETED' ? 'Completada' : status === 'IN_PROGRESS' ? 'En curso' : 'Pendiente'}</span>
    </button>
  );
}
