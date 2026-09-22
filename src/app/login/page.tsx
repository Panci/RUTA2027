'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Por favor, completa el correo y la contraseña.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        window.location.href = '/';
      } else {
        setErrorMessage(data.error || 'Credenciales no válidas.');
      }
    } catch (err: any) {
      setErrorMessage('Error de conexión al servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setErrorMessage('');
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
          Plataforma de Mando y Estrategia para Elecciones Municipales
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-600" />
              Acceso Restringido al Comité Electoral
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identifícate con tus credenciales asignadas de campaña.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@campana.es"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Contraseña
                </label>
                <Link
                  href="/recuperar-contrasena"
                  className="text-[11px] text-red-600 hover:text-red-700 font-semibold transition"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg transition duration-150 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Verificando credenciales...</span>
              ) : (
                <>
                  <span>Entrar al Panel de Mando</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Selector Rápido de Demostración */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Credenciales de prueba / Demostración:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@campana.es', 'Demo2027!')}
                className="p-2 rounded-lg border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-left transition"
              >
                <div className="font-bold text-purple-900">Admin Global</div>
                <div className="text-[10px] text-purple-700">admin@campana.es</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('directora@campana.es', 'Demo2027!')}
                className="p-2 rounded-lg border border-red-200 bg-red-50/70 hover:bg-red-100 text-left transition"
              >
                <div className="font-bold text-red-900">Directora Campaña</div>
                <div className="text-[10px] text-red-700">directora@campana.es</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('supervisor@campana.es', 'Demo2027!')}
                className="p-2 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-left transition"
              >
                <div className="font-bold text-blue-900">Supervisor Global</div>
                <div className="text-[10px] text-blue-700">Solo Lectura</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('candidato@campana.es', 'Demo2027!')}
                className="p-2 rounded-lg border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-left transition"
              >
                <div className="font-bold text-emerald-900">Candidato</div>
                <div className="text-[10px] text-emerald-700">candidato@campana.es</div>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Contraseña común de prueba: <code className="font-mono text-slate-600 bg-slate-100 px-1 py-0.5 rounded">Demo2027!</code>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400 space-y-1">
          <p>Plataforma interna confidencial para candidaturas de las Elecciones Municipales 2027.</p>
          <p className="text-[11px] text-slate-400">
            Conforme con el RGPD, la LOPDGDD y la LOREG.
          </p>
        </div>
      </div>
    </div>
  );
}
