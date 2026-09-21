'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import RoleSwitcher from './RoleSwitcher';
import { permissions, UserRole } from '@/lib/permissions';
import { SessionUser } from '@/lib/auth';
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
  LogOut,
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
      { name: 'Municipios y Sedes', href: '/municipios', icon: MapPin },
      { name: 'Cuadro de Mando (KPIs)', href: '/indicadores', icon: BarChart3 },
      { name: 'Configuración Campaña', href: '/configuracion', icon: Settings },
      { name: 'Despliegue VPS Dokploy', href: '/dokploy', icon: Server },
    ],
  },
];

export default function Sidebar({
  activeRole = 'CAMPAIGN_DIRECTOR',
  user,
}: {
  activeRole?: UserRole;
  user?: SessionUser | null;
}) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
    }
  };

  const filteredGroups = navigationItems
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (item.href === '/dokploy') {
          return permissions.canViewDevOps(activeRole);
        }
        return true;
      }),
    }))
    .filter((group) => group.items.length > 0);

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
        {filteredGroups.map((group, gIdx) => (
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

      {/* Footer / Active User & Role Switcher */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/70 space-y-2">
        {user && (
          <div className="flex items-center justify-between px-1 pb-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-red-950 border border-red-800 flex items-center justify-center text-xs font-bold text-red-300 shrink-0">
                {user.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-200 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition shrink-0"
              title="Cerrar sesión de forma segura"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <RoleSwitcher initialRole={activeRole} />

        <div className="flex items-center justify-center gap-2 pt-1 text-[10px] text-slate-400">
          <Link href="/privacidad" className="hover:text-slate-200 transition">
            Privacidad
          </Link>
          <span>•</span>
          <Link href="/aviso-legal" className="hover:text-slate-200 transition">
            Aviso Legal
          </Link>
        </div>
      </div>
    </aside>
  );
}
