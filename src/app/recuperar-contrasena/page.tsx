'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle, KeyRound, ExternalLink } from 'lucide-react';

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email) {
      setErrorMessage('Por favor, introduce tu correo electrónico.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsSuccess(true);
        if (data.devResetUrl) {
          setDevResetUrl(data.devResetUrl);
        }
      } else {
        setErrorMessage(data.error || 'No se pudo procesar la solicitud.');
      }
    } catch {
      setErrorMessage('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-800">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600 text-white font-extrabold text-2xl shadow-xl shadow-red-900/40 mb-3">
          R27
        </div>
        <h1 className="text-2xl font-black text-white tracking-wide">
          RUTA 2027
        </h1>
        <p className="text-xs font-medium text-slate-400 mt-1">
          Recuperación Segura de Acceso al Comité Electoral
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-red-600" />
              ¿Olvidaste tu contraseña?
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Introduce el correo asignado a tu cuenta y te facilitaremos un enlace de restablecimiento válido durante 60 minutos.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Solicitud tramitada con éxito</span>
                </div>
                <p>
                  Si el correo <strong className="font-semibold">{email}</strong> está registrado, se han generado las credenciales de recuperación.
                </p>
              </div>

              {devResetUrl && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-amber-950">
                    <span>⚡ Enlace de restablecimiento generado:</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Puedes acceder directamente a través de este enlace para definir tu nueva contraseña:
                  </p>
                  <Link
                    href={devResetUrl}
                    className="inline-flex items-center gap-1.5 font-bold text-red-600 hover:text-red-700 underline text-xs"
                  >
                    <span>Restablecer contraseña ahora</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver al Inicio de Sesión</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@campana.es"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg transition duration-150 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Generando solicitud...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar Enlace de Recuperación</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Recordé mi contraseña, volver</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
