'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import RoleSwitcher from './RoleSwitcher';
import { permissions, UserRole, isRouteAllowedForRole } from '@/lib/permissions';
import { SessionUser } from '@/lib/auth';
import {
  Calendar,
  Compass,
  FileSpreadsheet,
  Users,
  MapPin,
  TrendingUp,
  Target,
  Milestone,
  MessageSquareQuote,
  Megaphone,
  Eye,
  ClipboardList,
  ClipboardCheck,
  BarChart3,
  Server,
  Settings,
  Printer,
  LogOut,
  Layers,
  Presentation,
  UserCheck,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  iconBg: string;
  cardClass: string;
  activeClass: string;
}

interface NavGroup {
  group: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

const navigationGroups: NavGroup[] = [
  {
    group: 'Operativa Semanal',
    icon: Calendar,
    items: [
      {
        name: 'Esta Semana',
        href: '/',
        icon: Calendar,
        description: 'Agenda prioritaria y tareas activas',
        iconBg: 'bg-blue-600',
        cardClass: 'bg-[#eff6ff] hover:bg-[#dbeafe] border-[#bfdbfe]',
        activeClass: 'bg-[#dbeafe] border-[#60a5fa] ring-2 ring-blue-400/40',
      },
      {
        name: 'Actos y Visitas',
        href: '/actos',
        icon: Megaphone,
        description: 'Mítines, carpas y salidas a pie',
        iconBg: 'bg-emerald-600',
        cardClass: 'bg-[#ecfdf5] hover:bg-[#d1fae5] border-[#a7f3d0]',
        activeClass: 'bg-[#d1fae5] border-[#34d399] ring-2 ring-emerald-400/40',
      },
      {
        name: 'Seguimiento y Reuniones',
        href: '/seguimiento',
        icon: ClipboardList,
        description: 'Actas y acuerdos del comité',
        iconBg: 'bg-purple-600',
        cardClass: 'bg-[#faf5ff] hover:bg-[#f3e8ff] border-[#e9d5ff]',
        activeClass: 'bg-[#f3e8ff] border-[#c084fc] ring-2 ring-purple-400/40',
      },
      {
        name: 'Informe Semanal (PDF)',
        href: '/informe',
        icon: Printer,
        description: 'Reporte ejecutivo para imprimir',
        iconBg: 'bg-amber-500',
        cardClass: 'bg-[#fffbeb] hover:bg-[#fef3c7] border-[#fde68a]',
        activeClass: 'bg-[#fef3c7] border-[#fbbf24] ring-2 ring-amber-400/40',
      },
      {
        name: 'Presentación del Sistema',
        href: '/presentacion',
        icon: Presentation,
        description: 'Diapositivas y demo de funciones',
        iconBg: 'bg-rose-600',
        cardClass: 'bg-[#fff1f2] hover:bg-[#ffe4e6] border-[#fecdd3]',
        activeClass: 'bg-[#ffe4e6] border-[#fb7185] ring-2 ring-rose-400/40',
      },
    ],
  },
  {
    group: 'Diagnóstico y Análisis',
    icon: Compass,
    items: [
      {
        name: 'Resultados 2023',
        href: '/resultados-2023',
        icon: FileSpreadsheet,
        description: 'Escrutinio base y correlación',
        iconBg: 'bg-sky-600',
        cardClass: 'bg-[#f0f9ff] hover:bg-[#e0f2fe] border-[#bae6fd]',
        activeClass: 'bg-[#e0f2fe] border-[#38bdf8] ring-2 ring-sky-400/40',
      },
      {
        name: 'Partidos y Rivales',
        href: '/partidos',
        icon: Users,
        description: 'Mapeo de fuerzas y candidaturas',
        iconBg: 'bg-indigo-600',
        cardClass: 'bg-[#eef2ff] hover:bg-[#e0e7ff] border-[#c7d2fe]',
        activeClass: 'bg-[#e0e7ff] border-[#818cf8] ring-2 ring-indigo-400/40',
      },
      {
        name: 'Análisis por Distritos',
        href: '/distritos',
        icon: MapPin,
        description: 'Comportamiento mesa a mesa',
        iconBg: 'bg-teal-600',
        cardClass: 'bg-[#f0fdfa] hover:bg-[#ccfbf1] border-[#99f6e4]',
        activeClass: 'bg-[#ccfbf1] border-[#2dd4bf] ring-2 ring-teal-400/40',
      },
      {
        name: 'Simulación Electoral',
        href: '/simulacion',
        icon: TrendingUp,
        description: 'Reparto D\'Hondt y escenarios',
        iconBg: 'bg-rose-500',
        cardClass: 'bg-[#fff1f2] hover:bg-[#ffe4e6] border-[#fecdd3]',
        activeClass: 'bg-[#ffe4e6] border-[#fb7185] ring-2 ring-rose-400/40',
      },
      {
        name: 'Diagnóstico DAFO',
        href: '/diagnostico',
        icon: Compass,
        description: 'Matriz estratégica territorial',
        iconBg: 'bg-orange-500',
        cardClass: 'bg-[#fff7ed] hover:bg-[#ffedd5] border-[#fed7aa]',
        activeClass: 'bg-[#ffedd5] border-[#fb923c] ring-2 ring-orange-400/40',
      },
      {
        name: 'Auditoría 21 Preguntas',
        href: '/auditoria',
        icon: ClipboardCheck,
        description: 'Test integral de 12 dimensiones',
        iconBg: 'bg-rose-600',
        cardClass: 'bg-[#fff1f2] hover:bg-[#ffe4e6] border-[#fecdd3]',
        activeClass: 'bg-[#ffe4e6] border-[#f43f5e] ring-2 ring-rose-500/40',
      },
    ],
  },
  {
    group: 'Estrategia y Mensaje',
    icon: Target,
    items: [
      {
        name: 'Objetivo y 3 Prioridades',
        href: '/prioridades',
        icon: Target,
        description: 'Meta de concejales y pilares',
        iconBg: 'bg-rose-500',
        cardClass: 'bg-[#fff1f2] hover:bg-[#ffe4e6] border-[#fecdd3]',
        activeClass: 'bg-[#ffe4e6] border-[#fb7185] ring-2 ring-rose-400/40',
      },
      {
        name: 'Hoja de Ruta 2026-27',
        href: '/hoja-de-ruta',
        icon: Milestone,
        description: 'Cronograma hasta elecciones',
        iconBg: 'bg-blue-600',
        cardClass: 'bg-[#eff6ff] hover:bg-[#dbeafe] border-[#bfdbfe]',
        activeClass: 'bg-[#dbeafe] border-[#60a5fa] ring-2 ring-blue-400/40',
      },
      {
        name: 'Banco de Mensajes',
        href: '/mensajes',
        icon: MessageSquareQuote,
        description: 'Argumentarios y respuestas clave',
        iconBg: 'bg-purple-600',
        cardClass: 'bg-[#faf5ff] hover:bg-[#f3e8ff] border-[#e9d5ff]',
        activeClass: 'bg-[#f3e8ff] border-[#c084fc] ring-2 ring-purple-400/40',
      },
      {
        name: 'Radar de Competidores',
        href: '/competidores',
        icon: Eye,
        description: 'Seguimiento de rivales',
        iconBg: 'bg-sky-600',
        cardClass: 'bg-[#f0f9ff] hover:bg-[#e0f2fe] border-[#bae6fd]',
        activeClass: 'bg-[#e0f2fe] border-[#38bdf8] ring-2 ring-sky-400/40',
      },
    ],
  },
  {
    group: 'Dirección y Control',
    icon: Settings,
    items: [
      {
        name: 'Municipios y Sedes',
        href: '/municipios',
        icon: MapPin,
        description: 'Censo local y sedes activas',
        iconBg: 'bg-emerald-600',
        cardClass: 'bg-[#ecfdf5] hover:bg-[#d1fae5] border-[#a7f3d0]',
        activeClass: 'bg-[#d1fae5] border-[#34d399] ring-2 ring-emerald-400/40',
      },
      {
        name: 'Equipo y Accesos',
        href: '/equipo',
        icon: UserCheck,
        description: 'Gestión de roles y colaboradores',
        iconBg: 'bg-cyan-600',
        cardClass: 'bg-[#ecfeff] hover:bg-[#cffafe] border-[#a5f3fc]',
        activeClass: 'bg-[#cffafe] border-[#22d3ee] ring-2 ring-cyan-400/40',
      },
      {
        name: 'Cuadro de Mando (KPIs)',
        href: '/indicadores',
        icon: BarChart3,
        description: 'Métricas e indicadores de avance',
        iconBg: 'bg-amber-500',
        cardClass: 'bg-[#fffbeb] hover:bg-[#fef3c7] border-[#fde68a]',
        activeClass: 'bg-[#fef3c7] border-[#fbbf24] ring-2 ring-amber-400/40',
      },
      {
        name: 'Configuración Campaña',
        href: '/configuracion',
        icon: Settings,
        description: 'Parámetros legales y censo',
        iconBg: 'bg-slate-600',
        cardClass: 'bg-[#f8fafc] hover:bg-[#f1f5f9] border-[#cbd5e1]',
        activeClass: 'bg-[#f1f5f9] border-[#94a3b8] ring-2 ring-slate-400/40',
      },
      {
        name: 'Despliegue VPS Dokploy',
        href: '/dokploy',
        icon: Server,
        description: 'Servidor y base de datos cloud',
        iconBg: 'bg-violet-600',
        cardClass: 'bg-[#f5f3ff] hover:bg-[#ede9fe] border-[#ddd6fe]',
        activeClass: 'bg-[#ede9fe] border-[#a78bfa] ring-2 ring-violet-400/40',
      },
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

  const filteredGroups = navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => isRouteAllowedForRole(item.href, activeRole)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside className="w-72 lg:w-80 bg-[#f8fafc] text-slate-800 min-h-screen flex flex-col border-r border-slate-200/90 shrink-0 print:hidden select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200/80 bg-white flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center font-black text-white shadow-xs text-sm shrink-0">
          R27
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="font-extrabold text-slate-900 tracking-wide text-sm">
              RUTA 2027
            </h1>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold border border-emerald-200">
              PRO
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Estrategia Municipal</p>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4 text-sm">
        {filteredGroups.map((group, gIdx) => {
          const GroupIcon = group.icon;
          return (
            <div
              key={gIdx}
              className="bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-2xs space-y-2"
            >
              {/* Section Header */}
              <div className="flex items-center justify-between px-1.5 pt-0.5 pb-1 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <GroupIcon className="w-3.5 h-3.5 text-slate-400" />
                  <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                    {group.group}
                  </h2>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {group.items.length}
                </span>
              </div>

              {/* Section Buttons */}
              <div className="space-y-1.5 pt-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-2xl border transition-all duration-150 text-left group ${
                        isActive
                          ? `${item.activeClass} shadow-xs font-semibold`
                          : `${item.cardClass} shadow-2xs`
                      }`}
                    >
                      {/* Circular Colored Icon Badge */}
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${item.iconBg} text-white flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105`}
                      >
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.2]" />
                      </div>

                      {/* Title & Subtitle */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`font-bold text-xs sm:text-[13px] leading-tight truncate block ${
                              isActive ? 'text-slate-900' : 'text-slate-800'
                            }`}
                          >
                            {item.name}
                          </span>
                          {isActive && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                          )}
                        </div>
                        <span className="text-[10px] sm:text-[11px] text-slate-500 leading-tight truncate block mt-0.5 font-normal">
                          {item.description}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer / Active User & Role Switcher */}
      <div className="p-3 border-t border-slate-200/80 bg-white/90 space-y-2 shrink-0">
        {user && (
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-xs font-black text-rose-700 shrink-0">
                {user.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0"
              title="Cerrar sesión de forma segura"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Simulador de roles visible para el Administrador Global o en entorno de desarrollo */}
        {(!user || user.role === 'ADMIN' || process.env.NODE_ENV !== 'production') && (
          <RoleSwitcher initialRole={activeRole} />
        )}

        <div className="flex items-center justify-center gap-2 pt-1 text-[10px] text-slate-400 font-medium">
          <Link href="/privacidad" className="hover:text-slate-600 transition">
            Privacidad
          </Link>
          <span>•</span>
          <Link href="/aviso-legal" className="hover:text-slate-600 transition">
            Aviso Legal
          </Link>
        </div>
      </div>
    </aside>
  );
}
