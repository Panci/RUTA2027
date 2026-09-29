import React from 'react';
import prisma from '@/lib/prisma';
import { getActiveCampaign } from '@/lib/campaign-context';
import { getActiveRole, permissions } from '@/lib/permissions-server';
import TaskCreatorModal from '@/components/TaskCreatorModal';
import TaskStatusToggle from '@/components/TaskStatusToggle';
import TaskEditDeleteModal from '@/components/TaskEditDeleteModal';
import { Megaphone, MapPin, Target, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ActosPage() {
  const activeRole = await getActiveRole();
  const canCreate = permissions.canCreateTasks(activeRole);
  const canChangeStatus = permissions.canChangeTaskStatus(activeRole);

  const campaign = await getActiveCampaign({
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

  const districtOptions = campaign.districts.map((d) => ({ id: d.id, name: d.name }));
  const priorityOptions = campaign.priorities.map((p) => ({
    id: p.id,
    orderNumber: p.orderNumber,
    title: p.title,
  }));

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
            Registro pormenorizado de presencia vecinal, objetivos territoriales y mensajes transmitidos en {campaign.municipality}.
          </p>
        </div>

        <TaskCreatorModal
          districts={districtOptions}
          priorities={priorityOptions}
          readOnly={!canCreate}
        />
      </div>

      {campaign.actionTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center space-y-4">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Megaphone className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-bold text-slate-800 text-base">No hay actos ni visitas programadas</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Planifica carpas vecinales, paseos por barriadas, reuniones sectoriales o actos públicos para {campaign.municipality}.
            </p>
          </div>
          <TaskCreatorModal
            districts={districtOptions}
            priorities={priorityOptions}
            readOnly={!canCreate}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {campaign.actionTasks.map((act) => (
            <div key={act.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 hover:border-slate-300 transition">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {act.type}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1.5">{act.title}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-red-600" />
                    {act.district?.name || 'Ámbito Municipal General'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <TaskStatusToggle taskId={act.id} initialStatus={act.status} disabled={!canChangeStatus} />
                  <TaskEditDeleteModal
                    task={act}
                    districts={districtOptions}
                    priorities={priorityOptions}
                    canManage={canCreate}
                  />
                </div>
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
      )}
    </div>
  );
}
