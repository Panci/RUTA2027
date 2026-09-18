import React from 'react';
import prisma from '@/lib/prisma';
import { MessageSquareQuote, ShieldCheck, HelpCircle, Database, BookOpen, MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MensajesPage() {
  const campaign = await prisma.campaign.findFirst({
    include: {
      messageBank: {
        include: { district: true },
      },
    },
  });

  if (!campaign) {
    return <div className="p-8 text-center text-slate-500">Campaña no disponible.</div>;
  }

  const keyMessages = campaign.messageBank.filter((m) => m.category === 'KEY_MESSAGE');
  const attackResponses = campaign.messageBank.filter((m) => m.category === 'ATTACK_RESPONSE');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-red-600">
            Comunicación y Relato
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Banco de Mensajes y Argumentarios</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Estructura de discurso, réplicas a ataques, preguntas frecuentes y datos contrastados de Valle Real.
        </p>
      </div>

      {/* Mensajes Principales */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <MessageSquareQuote className="w-5 h-5 text-red-600" />
          Mensajes Principales de Campaña
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {keyMessages.map((msg) => (
            <div key={msg.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">{msg.title}</h3>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                "{msg.content}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Respuestas a Ataques Previsibles */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          Respuestas a Ataques de Rivales
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attackResponses.map((msg) => (
            <div key={msg.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Ataque Previsible
              </span>
              <h3 className="font-bold text-slate-900 text-sm mt-1">{msg.title}</h3>
              <div className="space-y-1 text-xs">
                <span className="font-bold text-emerald-700 block">Réplica Oficial Recomendada:</span>
                <p className="text-slate-800 bg-emerald-50/60 p-3 rounded-lg border border-emerald-200/60">
                  {msg.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
