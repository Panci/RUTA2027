import React from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft, Scale, Cookie, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AvisoLegalPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6 text-slate-800">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al Panel
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600">
            <Scale className="w-4 h-4" />
            Marco Jurídico e Institucional
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Aviso Legal y Condiciones de Uso
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Conforme a la Ley 34/2002 (LSSI-CE) y a la Ley Orgánica 5/1985 (LOREG).
          </p>
        </div>

        <div className="space-y-5 text-xs text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">1. Titularidad y Uso de la Plataforma</h2>
            <p>
              El software <strong>Ruta 2027</strong> es una herramienta digital de gestión electoral y operativa
              destinada exclusivamente al uso interno y confidencial de la dirección de campaña, candidatos y
              responsables territoriales acreditados. Queda estrictamente prohibida su difusión pública o acceso no autorizado.
            </p>
          </section>

          <section className="space-y-2 p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-950">
            <h2 className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              2. Régimen Electoral General (LOREG)
            </h2>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-900">
              <li>
                <strong>Censo Electoral (Art. 41.5 LOREG)</strong>: La información de censo tratada en este sistema
                corresponde a magnitudes numéricas globales por distrito electoral. Queda prohibida la carga de censos
                nominales o la utilización de datos para fines distintos a los previstos legalmente.
              </li>
              <li>
                <strong>Prohibición de Difusión de Sondeos (Art. 69.7 LOREG)</strong>: Las simulaciones y repartos
                D'Hondt generados en el módulo de escenarios constituyen proyecciones estratégicas de trabajo interno.
                No podrán ser difundidas públicamente como sondeos de opinión durante los cinco días previos a la votación.
              </li>
              <li>
                <strong>Contabilidad Electoral (Arts. 121 y ss. LOREG)</strong>: Las asignaciones de recursos y
                presupuestos de campaña reflejadas en la plataforma tienen carácter estimativo de coordinación y no sustituyen
                la contabilidad oficial presentada ante el Tribunal de Cuentas por el Administrador Electoral.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Cookie className="w-4 h-4 text-blue-600" />
              3. Política de Cookies Técnicas
            </h2>
            <p>
              Esta plataforma utiliza exclusivamente <strong>cookies técnicas estrictamente necesarias</strong> para su
              correcto funcionamiento y seguridad, exentas de la obligación de consentimiento del artículo 22.2 de la LSSI-CE:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
              <li>
                <code>auth_session</code>: Cookie de sesión cifrada (HttpOnly, SameSite=Lax) para autenticación y prevención de suplantación.
              </li>
              <li>
                <code>active_user_role</code>: Identificador del perfil operativo activo.
              </li>
              <li>
                <code>active_campaign_id</code>: Identificador del municipio seleccionado para aislar la información.
              </li>
            </ul>
            <p>
              No se emplean cookies publicitarias ni herramientas de rastreo o analítica de terceros.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
