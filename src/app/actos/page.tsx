import React from 'react';
import prisma from '@/lib/prisma';
import TaskCreatorModal from '@/components/TaskCreatorModal';
import TaskStatusToggle from '@/components/TaskStatusToggle';
import { Megaphone, MapPin, Target, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ActosPage() {
  const campaign = await prisma.campaign.findFirst({
    include: {
      districts: true,
      priorities: true,
      actionTasks: {
        include: {
          district: true,
          priority: true,
          responsible: true,
        },
        orderBy: { dueDate: 'asc' },
      },
    },
  });

  if (!campaign) {
    return <div className="p-8 text-center text-slate-500">Campaña no disponible.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-red-600">
              Agenda de Calle y Contacto
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Actos, Visitas y Acciones de Campaña</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Registro pormenorizado de presencia vecinal, objetivos territoriales y mensajes transmitidos.
          </p>
        </div>

        <TaskCreatorModal
          districts={campaign.districts.map((d) => ({ id: d.id, name: d.name }))}
          priorities={campaign.priorities.map((p) => ({ id: p.id, orderNumber: p.orderNumber, title: p.title }))}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {campaign.actionTasks.map((act) => (
          <div key={act.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {act.type}
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-1.5">{act.title}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-red-600" />
                  {act.district?.name || 'Ámbito Municipal'}
                </p>
              </div>

              <TaskStatusToggle taskId={act.id} initialStatus={act.status} />
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="font-semibold text-slate-500 block">¿Para qué se realiza? (Finalidad):</span>
                <p className="text-slate-800 mt-0.5">{act.description || 'Contacto ciudadano directo.'}</p>
              </div>

              {act.targetAudience && (
                <div>
                  <span className="font-semibold text-slate-500 block">Público al que se dirige:</span>
                  <p className="text-slate-700 mt-0.5">{act.targetAudience}</p>
                </div>
              )}

              {act.keyMessage && (
                <div>
                  <span className="font-semibold text-emerald-700 block">Mensaje Principal:</span>
                  <p className="text-slate-700 italic bg-emerald-50/60 p-2 rounded border border-emerald-100 mt-0.5">
                    "{act.keyMessage}"
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
                <span>Fecha: <strong>{new Date(act.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</strong></span>
                <span>Responsable: <strong>{act.responsible?.name || 'Equipo de campaña'}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
