import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, FileText, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function PrivacidadPage() {
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
            <ShieldCheck className="w-4 h-4" />
            Normativa de Protección de Datos
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Política de Privacidad y Protección de Datos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Conforme al Reglamento (UE) 2016/679 (RGPD) y a la Ley Orgánica 3/2018 (LOPDGDD).
          </p>
        </div>

        <div className="space-y-5 text-xs text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">1. Responsable del Tratamiento</h2>
            <p>
              El responsable del tratamiento de los datos gestionados en la plataforma <strong>Ruta 2027</strong> es la
              Candidatura y el Comité Electoral Municipal debidamente constituido ante la Junta Electoral de Zona competente.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">2. Finalidad Exclusiva del Tratamiento</h2>
            <p>
              Los datos tratados en este sistema tienen como única finalidad la organización interna, planificación
              estratégica, coordinación territorial de actos públicos y seguimiento de hitos de campaña de cara a los
              comicios municipales de mayo de 2027.
            </p>
          </section>

          <section className="space-y-2 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-600" />
              3. Principio de Minimización y Datos de Categoría Especial (Opiniones Políticas)
            </h2>
            <p>
              En estricto cumplimiento del <strong>artículo 9 del RGPD</strong> y la jurisprudencia del Tribunal
              Constitucional (<strong>Sentencia STC 76/2019</strong>), esta plataforma <strong>NO almacena ni elabora
              perfiles ideológicos individualizados de electores o vecinos</strong>.
            </p>
            <p>
              Los datos censales y de resultados electorales incorporados corresponden a <strong>cifras estadísticas
              oficiales y agregadas por distrito o mesa</strong>, de naturaleza pública según la LOREG, no siendo
              susceptibles de identificar individualmente a ningún ciudadano.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">4. Usuarios y Acceso a la Plataforma</h2>
            <p>
              El acceso a la plataforma está restringido a miembros acreditados del equipo de campaña mediante
              credenciales individuales protegidas por hash criptográfico y sesiones autenticadas. Queda prohibida la
              cesión de claves o el acceso de personal no autorizado.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">5. Ejercicio de Derechos</h2>
            <p>
              Cualquier usuario o colaborador registrado puede ejercer sus derechos de acceso, rectificación, supresión,
              limitación y oposición dirigiéndose al Delegado de Protección de Datos (DPD) de la candidatura a través del
              correo electrónico oficial facilitado a tal efecto.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
