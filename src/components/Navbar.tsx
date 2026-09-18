'use client';

import React from 'react';
import { CalendarDays, MapPin, AlertCircle } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm print:hidden">
      {/* Campaign & Context */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <MapPin className="w-4 h-4 text-red-600" />
          <span>Valle Real — Elecciones Municipales 2027</span>
        </div>
        <span className="text-slate-300">|</span>
        <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Fase 1: Diagnóstico y Preparación
        </div>
      </div>

      {/* Countdown & Quick Actions */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md border border-slate-200 font-medium">
          <CalendarDays className="w-4 h-4 text-slate-500" />
          <span>Elecciones: <strong>23 Mayo 2027</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>Reunión de comité: Miércoles 18:00h</span>
        </div>
      </div>
    </header>
  );
}
