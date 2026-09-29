import React from 'react';
import prisma from '@/lib/prisma';
import { getActiveCampaign } from '@/lib/campaign-context';
import { getActiveRole, permissions } from '@/lib/permissions-server';
import Link from 'next/link';
import { ClipboardList, Calendar, CheckCircle2, AlertCircle, FileText, ArrowRight, Printer } from 'lucide-react';
import MeetingModal from '@/components/MeetingModal';

export const dynamic = 'force-dynamic';

export default async function SeguimientoPage() {
  const campaign = await getActiveCampaign({
    include: {
      weeklyMeetings: {
        orderBy: { meetingDate: 'desc' },
      },
      weeklyReports: {
        orderBy: { weekNumber: 'desc' },
      },
    },
  });

  if (!campaign) {
    return <div className="p-8 text-center text-slate-500">Campaña no disponible.</div>;
  }

  const activeRole = await getActiveRole();
  const canManage = permissions.canManageMeetings(activeRole);
  const latestMeeting = campaign.weeklyMeetings[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-red-600">
              Gobernanza de Campaña
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Seguimiento Semanal y Reuniones de Comité</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Actas de comités de dirección, desbloqueo operativo y generación de informes de balance semanal.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <MeetingModal canManage={canManage} />

          <Link
            href="/informe"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition shadow flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            Ver / Imprimir Informe Semanal Oficial
          </Link>
        </div>
      </div>

      {/* Si no hay reuniones registradas */}
      {!latestMeeting && (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center space-y-3">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">No hay reuniones de comité registradas</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Registra la primera reunión semanal para levantar el acta de acuerdos, bloqueos y riesgos detectados.
          </p>
          <div className="pt-2 flex justify-center">
            <MeetingModal canManage={canManage} />
          </div>
        </div>
      )}

      {/* Última Reunión de Comité */}
      {latestMeeting && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-600" />
              <h2 className="font-bold text-slate-800 text-base">
                Última Reunión del Comité: {new Date(latestMeeting.meetingDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                Acta Oficial Cerrada
              </span>
              <MeetingModal meeting={latestMeeting} canManage={canManage} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="space-y-3">
              <div>
                <span className="font-bold text-slate-600 block uppercase text-[10px] tracking-wider mb-1">
                  1. Orden del Día Tratado
                </span>
                <p className="text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                  {latestMeeting.agenda}
                </p>
              </div>

              <div>
                <span className="font-bold text-emerald-700 block uppercase text-[10px] tracking-wider mb-1">
                  2. Decisiones y Acuerdos Tomados
                </span>
                <p className="text-slate-800 bg-emerald-50/50 p-3 rounded-lg border border-emerald-200/60 font-medium">
                  {latestMeeting.decisionsTaken}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="font-bold text-amber-700 block uppercase text-[10px] tracking-wider mb-1">
                  3. Bloqueos Identificados
                </span>
                <p className="text-slate-800 bg-amber-50/50 p-3 rounded-lg border border-amber-200/60">
                  {latestMeeting.roadblocks || 'Sin bloqueos críticos reportados.'}
                </p>
              </div>

              <div>
                <span className="font-bold text-rose-700 block uppercase text-[10px] tracking-wider mb-1">
                  4. Riesgos Nuevos Detectados
                </span>
                <p className="text-slate-800 bg-rose-50/50 p-3 rounded-lg border border-rose-200/60">
                  {latestMeeting.risksDetected || 'Sin riesgos adicionales.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historial de Reuniones Anteriores */}
      {campaign.weeklyMeetings.length > 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-slate-600" />
              <h3 className="font-bold text-slate-800 text-sm">Historial de Actas Anteriores</h3>
              <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-semibold">
                {campaign.weeklyMeetings.length - 1} anteriores
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {campaign.weeklyMeetings.slice(1).map((m) => (
              <div key={m.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {new Date(m.meetingDate).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] line-clamp-1">
                    <strong>Orden del día:</strong> {m.agenda}
                  </p>
                  <p className="text-emerald-700 text-[11px] line-clamp-1">
                    <strong>Acuerdos:</strong> {m.decisionsTaken}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <MeetingModal
                    meeting={m}
                    canManage={canManage}
                    triggerText="Editar / Ver"
                    triggerClassName="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition flex items-center gap-1.5"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modelo del Informe Semanal Ejecutivo (Sección 12) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-700" />
            <h2 className="font-bold text-slate-800 text-base">Estructura del Informe de Balance Semanal</h2>
          </div>
          <Link href="/informe" className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1">
            Abrir versión maquetada <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="font-bold text-emerald-700 block">✓ ¿Qué se hizo?</span>
            <p className="text-slate-600 text-[11px]">2 actos de calle en Distrito 2 y cierre de infografía de limpieza.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="font-bold text-rose-700 block">✕ ¿Qué no se hizo?</span>
            <p className="text-slate-600 text-[11px]">Faltó completar el censo de apoderados en mesas del Distrito 3.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="font-bold text-blue-700 block">👥 ¿Qué hicieron los rivales?</span>
            <p className="text-slate-600 text-[11px]">Rueda de prensa de la alcaldesa culpando a vecinos por la basura.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="font-bold text-purple-700 block">💡 ¿Qué aprendió el equipo?</span>
            <p className="text-slate-600 text-[11px]">El mensaje de vivienda moviliza al 100% a las familias del Ensanche.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
