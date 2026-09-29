'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Settings, Shield, Target, Calendar, Users, Wallet, Layers, AlertTriangle, UserCheck } from 'lucide-react';
import AuditLogViewer from './AuditLogViewer';

interface CampaignData {
  municipality: string;
  electionDate: string;
  candidacyName: string;
  partyOrCoalition: string;
  politicalGoal: string;
  mainAdversaries: string | null;
  teamDescription: string | null;
  availableResources: string | null;
  strengths: string | null;
  risks: string | null;
}

interface Props {
  campaign: CampaignData;
}

export default function ConfiguracionClient({ campaign }: Props) {
  const [activeTab, setActiveTab] = useState<'parametros' | 'auditoria'>('parametros');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-red-600">
              Administración y Control
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Configuración y Trazabilidad del Proyecto
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Datos institucionales de la candidatura, parámetros electorales y registro inmutable de auditoría.
          </p>
        </div>

        {/* Pestañas */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('parametros')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'parametros'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Parámetros de Campaña</span>
          </button>
          <button
            onClick={() => setActiveTab('auditoria')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'auditoria'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-red-600" />
            <span>Registro de Auditoría</span>
          </button>
        </div>
      </div>

      {activeTab === 'parametros' ? (
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
                defaultValue={campaign.electionDate}
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
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 block">Equipo Responsable y Voluntariado</label>
                <Link
                  href="/equipo"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 transition"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Gestionar Roles y Accesos del Equipo →</span>
                </Link>
              </div>
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
      ) : (
        <AuditLogViewer />
      )}
    </div>
  );
}
