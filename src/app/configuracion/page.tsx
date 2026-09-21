import React from 'react';
import prisma from '@/lib/prisma';
import { Settings, Shield, Target, Calendar, Users, Wallet, Layers, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ConfiguracionPage() {
  const campaign = await prisma.campaign.findFirst({
    include: {
      districts: true,
      parties: true,
    },
  });

  if (!campaign) {
    return <div className="p-8 text-center text-slate-500">Campaña no disponible.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-red-600">
            Parámetros del Proyecto
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Configuración de Campaña Municipal</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Datos institucionales de la candidatura, objetivo político y recursos para las elecciones de 2027.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Nombre del Municipio</label>
            <input
              type="text"
              defaultValue={campaign.municipality}
              readOnly
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Fecha Prevista de las Elecciones</label>
            <input
              type="date"
              defaultValue={campaign.electionDate.toISOString().split('T')[0]}
              readOnly
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Nombre de la Candidatura</label>
            <input
              type="text"
              defaultValue={campaign.candidacyName}
              readOnly
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Partido o Coalición</label>
            <input
              type="text"
              defaultValue={campaign.partyOrCoalition}
              readOnly
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Objetivo Político Oficial</label>
            <select
              defaultValue={campaign.politicalGoal}
              disabled
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-emerald-800"
            >
              <option value="GANAR" className="text-slate-900 bg-white">Ganar las elecciones</option>
              <option value="GOBERNAR" className="text-slate-900 bg-white">Gobernar</option>
              <option value="REPRESENTACION" className="text-slate-900 bg-white">Obtener representación</option>
              <option value="FORMAR_GOBIERNO" className="text-slate-900 bg-white">Formar parte del gobierno</option>
              <option value="POSICIONAMIENTO" className="text-slate-900 bg-white">Posicionarse para siguientes elecciones</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Adversarios Principales</label>
            <input
              type="text"
              defaultValue={campaign.mainAdversaries || ''}
              readOnly
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
            />
          </div>
        </div>

        <div className="space-y-4 text-xs pt-4 border-t border-slate-100">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Equipo Responsable y Voluntariado</label>
            <textarea
              defaultValue={campaign.teamDescription || ''}
              readOnly
              rows={2}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Recursos Disponibles</label>
            <textarea
              defaultValue={campaign.availableResources || ''}
              readOnly
              rows={2}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Fortalezas Identificadas</label>
              <textarea
                defaultValue={campaign.strengths || ''}
                readOnly
                rows={2}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Riesgos Políticos y Operativos</label>
              <textarea
                defaultValue={campaign.risks || ''}
                readOnly
                rows={2}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
