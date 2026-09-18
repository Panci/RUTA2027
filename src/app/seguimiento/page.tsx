import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ClipboardList, Calendar, CheckCircle2, AlertCircle, FileText, ArrowRight, Printer } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SeguimientoPage() {
  const campaign = await prisma.campaign.findFirst({
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

        <Link
          href="/informe"
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition shadow flex items-center gap-2"
        >
          <Printer className="w-4 h-4 text-emerald-400" />
          Ver / Imprimir Informe Semanal Oficial
        </Link>
      </div>

      {/* Última Reunión de Comité */}
      {latestMeeting && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-600" />
              <h2 className="font-bold text-slate-800 text-base">
                Última Reunión del Comité: {new Date(latestMeeting.meetingDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h2>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              Acta Oficial Cerrada
            </span>
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
