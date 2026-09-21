import React from 'react';
import prisma from '@/lib/prisma';
import { getActiveCampaign } from '@/lib/campaign-context';
import { getActiveRole, permissions } from '@/lib/permissions-server';
import Link from 'next/link';
import TaskCreatorModal from '@/components/TaskCreatorModal';
import TaskStatusToggle from '@/components/TaskStatusToggle';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  Target,
  Megaphone,
  Eye,
  ArrowRight,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EstaSemanaPage() {
  // Carga de datos operativos del municipio/campaña activo
  const campaign = await getActiveCampaign({
    include: {
      strategy: true,
      priorities: {
        orderBy: { orderNumber: 'asc' },
      },
      districts: true,
      parties: true,
      actionTasks: {
        include: {
          district: true,
          priority: true,
          competitorParty: true,
          responsible: true,
        },
        orderBy: { dueDate: 'asc' },
      },
      phases: {
        where: { status: 'IN_PROGRESS' },
        include: {
          milestones: true,
        },
      },
    },
  });

  if (!campaign) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">No se ha encontrado ninguna campaña activa</h2>
        <p className="text-slate-500 mt-2">Ejecuta el script de semilla o crea una nueva campaña desde configuración.</p>
      </div>
    );
  }

  const tasks = campaign.actionTasks;
  const pendingTasks = tasks.filter((t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS');
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');
  const eventsAndVisits = tasks.filter((t) => t.type === 'EVENT' || t.type === 'VISIT' || t.type === 'MEETING');
  const currentPhase = campaign.phases[0];

  const activeRole = await getActiveRole();
  const canCreate = permissions.canCreateTasks(activeRole);
  const canChangeStatus = permissions.canChangeTaskStatus(activeRole);

  // Competidores recientes
  const competitorLogs = await prisma.competitorTracking.findMany({
    take: 3,
    orderBy: { date: 'desc' },
    include: { party: true },
  });

  return (
    <div className="space-y-6">
      {/* 1. Header con Objetivo Central y Las 6 Preguntas Clave */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-red-400">
              Panel de Mando Operativo
            </span>
            <h1 className="text-2xl font-bold mt-1">Esta Semana en {campaign.municipality}</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Candidatura: <strong className="text-white">{campaign.candidacyName}</strong> | Objetivo:{' '}
              <span className="text-emerald-400 font-semibold">{campaign.politicalGoal}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <TaskCreatorModal
              districts={campaign.districts.map((d) => ({ id: d.id, name: d.name }))}
              priorities={campaign.priorities.map((p) => ({ id: p.id, orderNumber: p.orderNumber, title: p.title }))}
              readOnly={!canCreate}
            />
          </div>
        </div>

        {/* Las 6 Preguntas Clave para el Equipo */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
            <span className="text-slate-400 block font-medium">1. ¿Dónde somos fuertes?</span>
            <span className="font-bold text-emerald-400 text-sm mt-0.5 block">Distrito 4 (36.2%)</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
            <span className="text-slate-400 block font-medium">2. ¿Dónde lidera el rival?</span>
            <span className="font-bold text-blue-400 text-sm mt-0.5 block">Distrito 1 (PP 49.5%)</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
            <span className="text-slate-400 block font-medium">3. ¿Dónde crecer?</span>
            <span className="font-bold text-amber-400 text-sm mt-0.5 block">Distrito 2 (+18.5k censo)</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
            <span className="text-slate-400 block font-medium">4. ¿Público prioritario?</span>
            <span className="font-semibold text-slate-200 mt-0.5 block truncate">Familias trabajadoras &lt;40</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
            <span className="text-slate-400 block font-medium">5. ¿Prioridad de la semana?</span>
            <span className="font-semibold text-emerald-300 mt-0.5 block truncate">Limpieza y barrios</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
            <span className="text-slate-400 block font-medium">6. ¿Acción concreta?</span>
            <span className="font-semibold text-red-300 mt-0.5 block truncate">Paseo Ensanche D02</span>
          </div>
        </div>
      </div>

      {/* 2. Grid de Tres Columnas: Tareas Operativas, Actos de Calle y Banco de Mensaje */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna 1: Tareas Pendientes y de Campo */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tareas de la Semana */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-600" />
                <h2 className="font-bold text-slate-800 text-base">Acciones y Tareas de la Semana</h2>
                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-semibold">
                  {pendingTasks.length} activas
                </span>
              </div>
              <Link href="/actos" className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
                Ver todas ({tasks.length}) <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {pendingTasks.map((t) => (
                <div key={t.id} className="py-3.5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                        {t.type}
                      </span>
                      {t.district && (
                        <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-500" />
                          {t.district.name}
                        </span>
                      )}
                      {t.priority && (
                        <span className="text-xs px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded font-medium border border-emerald-200">
                          P{t.priority.orderNumber}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800">{t.title}</h3>
                    {t.description && <p className="text-xs text-slate-500">{t.description}</p>}
                    {t.keyMessage && (
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-1.5 rounded border border-slate-100">
                        💬 Mensaje: "{t.keyMessage}"
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0 space-y-1.5">
                    <span className="text-xs font-medium text-slate-500 block">
                      {new Date(t.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </span>
                    <TaskStatusToggle taskId={t.id} initialStatus={t.status} disabled={!canChangeStatus} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actos y Visitas Programadas */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-emerald-600" />
                <h2 className="font-bold text-slate-800 text-base">Agenda de Calle y Contacto Vecinal</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {eventsAndVisits.map((ev) => (
                <div key={ev.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1 text-red-600 font-semibold">
                      <MapPin className="w-3 h-3" />
                      {ev.district?.name || 'Municipal'}
                    </span>
                    <span>{new Date(ev.dueDate).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">{ev.title}</h4>
                  <p className="text-xs text-slate-600">Público: {ev.targetAudience || 'Vecindario general'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna 2: Disciplina de Mensaje, Prioridades y Radar de Rivales */}
        <div className="space-y-6">
          {/* Mensajes a Repetir vs Temas a Evitar */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-slate-800 text-base">Disciplina de Mensaje</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-emerald-700 uppercase tracking-wide text-[11px] block flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Mensajes a Repetir Siempre
                </span>
                <p className="mt-1 text-slate-700 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200">
                  {campaign.strategy?.messagesToRepeat || 'Inversión equitativa en los 5 distritos; plan de choque de limpieza.'}
                </p>
              </div>

              <div>
                <span className="font-bold text-red-700 uppercase tracking-wide text-[11px] block flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  Temas que Conviene Evitar
                </span>
                <p className="mt-1 text-slate-700 bg-red-50/70 p-2.5 rounded-lg border border-red-200">
                  {campaign.strategy?.topicsToAvoid || 'Disputas ideológicas estatales ajenas a los problemas locales.'}
                </p>
              </div>
            </div>
          </div>

          {/* Las 3 Prioridades Políticas */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Target className="w-5 h-5 text-red-600" />
              <h2 className="font-bold text-slate-800 text-base">Las 3 Prioridades Políticas</h2>
            </div>
            <div className="space-y-2.5">
              {campaign.priorities.map((p) => (
                <div key={p.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px]">
                      {p.orderNumber}
                    </span>
                    <span className="font-bold text-slate-800">{p.title}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] pl-7">{p.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Radar de Competidores */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-slate-800 text-base">Radar de Rivales</h2>
              </div>
              <Link href="/competidores" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                Ver todos
              </Link>
            </div>
            <div className="space-y-2">
              {competitorLogs.map((log) => (
                <div key={log.id} className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="px-1.5 py-0.5 rounded text-[10px] text-white" style={{ backgroundColor: log.party.colorHex }}>
                      {log.party.acronym}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800">{log.title}</h4>
                  <p className="text-slate-600 text-[11px]">{log.description}</p>
                  {log.opportunityToDifferentiate && (
                    <p className="text-[11px] text-emerald-700 bg-emerald-50 p-1 rounded font-medium border border-emerald-100">
                      🎯 Oportunidad: {log.opportunityToDifferentiate}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
