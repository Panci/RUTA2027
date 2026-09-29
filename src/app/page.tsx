import React from 'react';
import prisma from '@/lib/prisma';
import { getActiveCampaign } from '@/lib/campaign-context';
import { getActiveRole, permissions } from '@/lib/permissions-server';
import Link from 'next/link';
import TaskCreatorModal from '@/components/TaskCreatorModal';
import TaskStatusToggle from '@/components/TaskStatusToggle';
import TaskEditDeleteModal from '@/components/TaskEditDeleteModal';
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
  ShieldCheck,
  TrendingUp,
  Users,
  User,
  MessageSquare,
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

  const districtOptions = campaign.districts.map((d) => ({ id: d.id, name: d.name }));
  const priorityOptions = campaign.priorities.map((p) => ({
    id: p.id,
    orderNumber: p.orderNumber,
    title: p.title,
  }));

  // Competidores recientes
  const competitorLogs = await prisma.competitorTracking.findMany({
    take: 3,
    orderBy: { date: 'desc' },
    include: { party: true },
  });

  return (
    <div className="space-y-6">
      {/* 1. Header con Objetivo Central y Las 6 Preguntas Clave */}
      <div className="bg-white rounded-2xl p-6 shadow-2xs border border-slate-200/90 space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50/80 text-rose-700 border border-rose-200/80 text-xs font-bold uppercase tracking-wider">
              <Target className="w-3.5 h-3.5 text-rose-500" />
              <span>Panel de Mando Operativo</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Esta Semana en {campaign.municipality}
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 flex flex-wrap items-center gap-2">
              <span>
                Candidatura: <strong className="text-slate-800">{campaign.candidacyName}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span>
                Objetivo:{' '}
                <strong className="text-emerald-700 bg-emerald-50/80 border border-emerald-200/80 px-2 py-0.5 rounded-lg text-xs font-bold">
                  {campaign.politicalGoal}
                </strong>
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <TaskCreatorModal
              districts={districtOptions}
              priorities={priorityOptions}
              readOnly={!canCreate}
            />
          </div>
        </div>

        {/* Las 6 Preguntas Clave para el Equipo (Estilo Tarjetas Pastel con Círculos de Color) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* 1. ¿Dónde somos fuertes? */}
          <div className="bg-[#ecfdf5] hover:bg-[#d1fae5] border border-[#a7f3d0] p-3 rounded-2xl flex items-center gap-3 shadow-2xs transition-all group">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105">
              <ShieldCheck className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block truncate">
                1. ¿Dónde fuertes?
              </span>
              <span className="font-extrabold text-emerald-900 text-xs sm:text-sm mt-0.5 block truncate">
                Distrito 4 (36.2%)
              </span>
            </div>
          </div>

          {/* 2. ¿Dónde lidera el rival? */}
          <div className="bg-[#f0f9ff] hover:bg-[#e0f2fe] border border-[#bae6fd] p-3 rounded-2xl flex items-center gap-3 shadow-2xs transition-all group">
            <div className="w-10 h-10 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105">
              <Eye className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block truncate">
                2. ¿Lidera rival?
              </span>
              <span className="font-extrabold text-sky-900 text-xs sm:text-sm mt-0.5 block truncate">
                Distrito 1 (PP 49.5%)
              </span>
            </div>
          </div>

          {/* 3. ¿Dónde crecer? */}
          <div className="bg-[#fffbeb] hover:bg-[#fef3c7] border border-[#fde68a] p-3 rounded-2xl flex items-center gap-3 shadow-2xs transition-all group">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105">
              <TrendingUp className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block truncate">
                3. ¿Dónde crecer?
              </span>
              <span className="font-extrabold text-amber-900 text-xs sm:text-sm mt-0.5 block truncate">
                Distrito 2 (+18.5k)
              </span>
            </div>
          </div>

          {/* 4. ¿Público prioritario? */}
          <div className="bg-[#faf5ff] hover:bg-[#f3e8ff] border border-[#e9d5ff] p-3 rounded-2xl flex items-center gap-3 shadow-2xs transition-all group">
            <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105">
              <Users className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block truncate">
                4. ¿Público meta?
              </span>
              <span className="font-extrabold text-purple-900 text-xs sm:text-sm mt-0.5 block truncate">
                Familias &lt;40 años
              </span>
            </div>
          </div>

          {/* 5. ¿Prioridad de la semana? */}
          <div className="bg-[#f0fdfa] hover:bg-[#ccfbf1] border border-[#99f6e4] p-3 rounded-2xl flex items-center gap-3 shadow-2xs transition-all group">
            <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105">
              <Sparkles className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block truncate">
                5. ¿Prioridad semana?
              </span>
              <span className="font-extrabold text-teal-900 text-xs sm:text-sm mt-0.5 block truncate">
                Limpieza y barrios
              </span>
            </div>
          </div>

          {/* 6. ¿Acción concreta? */}
          <div className="bg-[#fff1f2] hover:bg-[#ffe4e6] border border-[#fecdd3] p-3 rounded-2xl flex items-center gap-3 shadow-2xs transition-all group">
            <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105">
              <Megaphone className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block truncate">
                6. ¿Acción concreta?
              </span>
              <span className="font-extrabold text-rose-900 text-xs sm:text-sm mt-0.5 block truncate">
                Paseo Ensanche D02
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Grid de Tres Columnas: Tareas Operativas, Actos de Calle y Banco de Mensaje */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna 1: Tareas Pendientes y de Campo */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tareas de la Semana */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-rose-500" />
                <h2 className="font-bold text-slate-800 text-base">Acciones y Tareas de la Semana</h2>
                <span className="text-xs px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200/80 rounded-full font-bold">
                  {pendingTasks.length} activas
                </span>
              </div>
              <Link href="/actos" className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 transition">
                Ver todas ({tasks.length}) <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="text-center py-10 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No hay tareas pendientes para esta semana</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Todas las acciones planificadas están al día o completadas.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {pendingTasks.map((t) => {
                  const typeConfig: Record<string, { label: string; badge: string; border: string }> = {
                    TASK: { label: 'Tarea', badge: 'bg-blue-50 text-blue-700 border-blue-200', border: 'border-l-blue-500' },
                    VISIT: { label: 'Visita', badge: 'bg-purple-50 text-purple-700 border-purple-200', border: 'border-l-purple-500' },
                    MEETING: { label: 'Reunión', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', border: 'border-l-emerald-500' },
                    EVENT: { label: 'Acto', badge: 'bg-amber-50 text-amber-700 border-amber-200', border: 'border-l-amber-500' },
                  };

                  const currentType = typeConfig[t.type] || {
                    label: t.type,
                    badge: 'bg-slate-100 text-slate-700 border-slate-200',
                    border: 'border-l-slate-400',
                  };

                  const priorityStyle =
                    t.priority?.orderNumber === 1
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : t.priority?.orderNumber === 2
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                  return (
                    <div
                      key={t.id}
                      className={`group bg-slate-50/70 hover:bg-white rounded-xl border border-slate-200/90 border-l-4 ${currentType.border} p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 transition-all duration-200 space-y-2.5`}
                    >
                      {/* Cabecera de la tarjeta: Badges + Fecha y Estado */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${currentType.badge}`}>
                            {t.type}
                          </span>

                          {t.district && (
                            <span className="text-xs font-medium text-slate-600 flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200/80 shadow-2xs">
                              <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                              {t.district.name}
                            </span>
                          )}

                          {t.priority && (
                            <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-bold border ${priorityStyle}`}>
                              P{t.priority.orderNumber}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-slate-200/80 shadow-2xs">
                            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                            {new Date(t.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                          </span>
                          <TaskStatusToggle taskId={t.id} initialStatus={t.status} disabled={!canChangeStatus} />
                          <TaskEditDeleteModal
                            task={t}
                            districts={districtOptions}
                            priorities={priorityOptions}
                            canManage={canCreate}
                          />
                        </div>
                      </div>

                      {/* Título y descripción */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors leading-snug">
                          {t.title}
                        </h3>
                        {t.description && (
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {t.description}
                          </p>
                        )}
                      </div>

                      {/* Mensaje clave / argumentario */}
                      {t.keyMessage && (
                        <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-2.5 text-xs text-slate-700 flex items-start gap-2">
                          <span className="text-amber-700 font-bold shrink-0 text-[11px] uppercase tracking-wider flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            Mensaje:
                          </span>
                          <span className="italic text-slate-800 font-medium">"{t.keyMessage}"</span>
                        </div>
                      )}

                      {/* Footer de la tarjeta: Responsable si existe */}
                      {t.responsible && (
                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            Responsable: <strong className="text-slate-700">{t.responsible.name}</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actos y Visitas Programadas */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-emerald-600" />
                <h2 className="font-bold text-slate-800 text-base">Agenda de Calle y Contacto Vecinal</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {eventsAndVisits.map((ev) => (
                <div key={ev.id} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1 text-rose-500 font-semibold">
                      <MapPin className="w-3 h-3" />
                      {ev.district?.name || 'Municipal'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span>{new Date(ev.dueDate).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                      <TaskEditDeleteModal
                        task={ev}
                        districts={districtOptions}
                        priorities={priorityOptions}
                        canManage={canCreate}
                      />
                    </div>
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
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
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
                <span className="font-bold text-rose-700 uppercase tracking-wide text-[11px] block flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  Temas que Conviene Evitar
                </span>
                <p className="mt-1 text-slate-700 bg-rose-50/70 p-2.5 rounded-lg border border-rose-200">
                  {campaign.strategy?.topicsToAvoid || 'Disputas ideológicas estatales ajenas a los problemas locales.'}
                </p>
              </div>
            </div>
          </div>

          {/* Las 3 Prioridades Políticas */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Target className="w-5 h-5 text-rose-500" />
              <h2 className="font-bold text-slate-800 text-base">Las 3 Prioridades Políticas</h2>
            </div>
            <div className="space-y-2.5">
              {campaign.priorities.map((p) => (
                <div key={p.id} className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-rose-200 font-bold flex items-center justify-center text-[10px]">
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
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-sky-600" />
                <h2 className="font-bold text-slate-800 text-base">Radar de Rivales</h2>
              </div>
              <Link href="/competidores" className="text-xs text-sky-600 hover:text-sky-700 font-semibold transition">
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
