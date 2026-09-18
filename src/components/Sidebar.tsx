'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  Compass,
  FileSpreadsheet,
  Users,
  MapPin,
  TrendingUp,
  Target,
  Flag,
  Milestone,
  MessageSquareQuote,
  Megaphone,
  Eye,
  ClipboardList,
  BarChart3,
  Server,
  Settings,
  ShieldCheck,
  Printer,
} from 'lucide-react';

const navigationItems = [
  {
    group: 'Operativa Semanal',
    items: [
      { name: 'Esta Semana', href: '/', icon: Calendar },
      { name: 'Actos y Visitas', href: '/actos', icon: Megaphone },
      { name: 'Seguimiento y Reuniones', href: '/seguimiento', icon: ClipboardList },
      { name: 'Informe Semanal (PDF)', href: '/informe', icon: Printer },
    ],
  },
  {
    group: 'Diagnóstico y Análisis',
    items: [
      { name: 'Resultados 2023', href: '/resultados-2023', icon: FileSpreadsheet },
      { name: 'Partidos y Rivales', href: '/partidos', icon: Users },
      { name: 'Análisis por Distritos', href: '/distritos', icon: MapPin },
      { name: 'Simulación Electoral', href: '/simulacion', icon: TrendingUp },
      { name: 'Diagnóstico DAFO', href: '/diagnostico', icon: Compass },
    ],
  },
  {
    group: 'Estrategia y Mensaje',
    items: [
      { name: 'Objetivo y 3 Prioridades', href: '/prioridades', icon: Target },
      { name: 'Hoja de Ruta 2026-27', href: '/hoja-de-ruta', icon: Milestone },
      { name: 'Banco de Mensajes', href: '/mensajes', icon: MessageSquareQuote },
      { name: 'Radar de Competidores', href: '/competidores', icon: Eye },
    ],
  },
  {
    group: 'Dirección y Control',
    items: [
      { name: 'Cuadro de Mando (KPIs)', href: '/indicadores', icon: BarChart3 },
      { name: 'Configuración Campaña', href: '/configuracion', icon: Settings },
      { name: 'Despliegue VPS Dokploy', href: '/dokploy', icon: Server },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 min-h-screen flex flex-col border-r border-slate-800 shrink-0 print:hidden">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white shadow-md">
          R27
        </div>
        <div>
          <h1 className="font-bold text-white tracking-wide text-sm flex items-center gap-1.5">
            RUTA 2027
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-medium border border-emerald-800">
              PRO
            </span>
          </h1>
          <p className="text-xs text-slate-400">Estrategia Municipal</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5 text-sm">
        {navigationItems.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <h2 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {group.group}
            </h2>
            <div className="space-y-0.5 pt-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-white shadow-sm border-l-4 border-red-500 pl-2'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / Active Role Indicator */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-slate-800/80 border border-slate-700/50">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <div className="text-xs">
            <p className="font-medium text-slate-200 leading-none">Comité de Dirección</p>
            <p className="text-[11px] text-slate-400">Rol: Director de Campaña</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
