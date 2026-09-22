import React from 'react';
import prisma from '@/lib/prisma';
import { getActiveCampaign } from '@/lib/campaign-context';
import Link from 'next/link';
import { FileText, Printer, ArrowLeft, MapPin, CheckCircle2, Clock, Eye, Sparkles } from 'lucide-react';
import PrintButton from './PrintButton';
import ExportPdfButton from './ExportPdfButton';

export const dynamic = 'force-dynamic';

export default async function InformePage() {
  const campaign = await getActiveCampaign({
    include: {
      strategy: true,
      priorities: true,
      districts: {
        include: {
          actionTasks: true,
        },
      },
      actionTasks: {
        include: {
          district: true,
          priority: true,
        },
      },
      weeklyMeetings: {
        orderBy: { meetingDate: 'desc' },
      },
    },
  });

  if (!campaign) {
    return <div className="p-8 text-center text-slate-500">Campaña no disponible.</div>;
  }

  const competitorLogs = await prisma.competitorTracking.findMany({
    take: 3,
    where: { party: { campaignId: campaign.id } },
    include: { party: true },
    orderBy: { date: 'desc' },
  });

  const completed = campaign.actionTasks.filter((t) => t.status === 'COMPLETED');
  const pending = campaign.actionTasks.filter((t) => t.status !== 'COMPLETED');

  return (
    <div className="space-y-6 max-w-4xl mx-auto print:max-w-none print:m-0 print:p-0">
      {/* Barra de control (oculta al imprimir) */}
      <div className="flex justify-between items-center print:hidden">
        <Link
          href="/seguimiento"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Seguimiento
        </Link>
        <div className="flex items-center gap-2">
          <ExportPdfButton
            elementId="informe-ejecutivo-content"
            fileName={`Informe_Semanal_Ruta2027_${campaign.municipality.replace(/\s+/g, '_')}.pdf`}
          />
          <PrintButton />
        </div>
      </div>

      {/* Documento Ejecutivo Imprimible y Exportable */}
      <div id="informe-ejecutivo-content" className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm print:border-none print:shadow-none print:p-0 space-y-6">
        {/* Cabecera Oficial */}
        <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-600">
              Documento Confidencial de Trabajo Interno
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              Informe Semanal de Dirección de Campaña
            </h1>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Municipio: <strong>{campaign.municipality}</strong> | Candidatura: <strong>{campaign.candidacyName}</strong>
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-900 block">Semana 38 / 2026</span>
            <span className="text-[11px] text-slate-500">
              Emitido: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* 1. Resumen Ejecutivo: Qué se hizo y Qué no se hizo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-2">
            <h3 className="font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              1. ¿Qué se hizo esta semana?
            </h3>
            <ul className="list-disc pl-4 text-slate-700 space-y-1">
              {completed.length > 0 ? (
                completed.map((t) => (
                  <li key={t.id}>
                    <strong>{t.title}</strong> ({t.district?.name || 'General'})
                  </li>
                ))
              ) : (
                <li>Finalización del diagnóstico de los 5 distritos y cierre de infografías.</li>
              )}
            </ul>
          </div>

          <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200 space-y-2">
            <h3 className="font-bold text-rose-900 uppercase tracking-wide flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-rose-600" />
              2. ¿Qué quedó pendiente o atrasado?
            </h3>
            <ul className="list-disc pl-4 text-slate-700 space-y-1">
              {pending.slice(0, 3).map((t) => (
                <li key={t.id}>
                  <strong>{t.title}</strong> — Límite: {new Date(t.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 2. Actividad por Distritos */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-red-600" />
            3. Balance Territorial por Distrito
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Distrito</th>
                  <th className="p-2.5">Clasificación</th>
                  <th className="p-2.5">Acciones Realizadas</th>
                  <th className="p-2.5">Situación Vecinal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaign.districts.map((d) => (
                  <tr key={d.id}>
                    <td className="p-2.5 font-bold text-slate-800">{d.name}</td>
                    <td className="p-2.5">{d.classification}</td>
                    <td className="p-2.5 font-semibold text-emerald-700">{d.actionTasks.length} registradas</td>
                    <td className="p-2.5 text-slate-600">{d.mainIssues?.slice(0, 50)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Seguimiento de Rivales */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-blue-600" />
            4. Movimientos de Rivales e Incidentes
          </h3>
          <div className="space-y-2">
            {competitorLogs.map((log) => (
              <div key={log.id} className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-0.5">
                <span className="font-bold text-slate-800">
                  [{log.party.acronym}] {log.title}
                </span>
                <p className="text-slate-600">{log.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Lecciones y Plan Siguiente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs pt-2">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-800 uppercase tracking-wide">5. ¿Qué aprendió el equipo?</h4>
            <p className="text-slate-600">
              La cercanía vecinal en el Ensanche y las propuestas de vivienda movilizan con fuerza al electorado indeciso; es imprescindible mantener ese pulso constante.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-800 uppercase tracking-wide">6. ¿Qué se hará la semana siguiente?</h4>
            <p className="text-slate-600">
              Paseo de campaña en Distrito 2, encuentro con la plataforma de alquiler en Distrito 4 y verificación técnica de colegios electorales en Distrito 3.
            </p>
          </div>
        </div>

        {/* Firma Oficial */}
        <div className="pt-6 border-t border-slate-200 flex justify-between text-xs text-slate-500">
          <div>
            <p className="font-bold text-slate-800">Elena Ramos</p>
            <p>Directora de Campaña</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-800">Carlos Navarro</p>
            <p>Candidato a la Alcaldía</p>
          </div>
        </div>
      </div>
    </div>
  );
}
