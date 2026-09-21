'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, ChevronUp, Check, Eye } from 'lucide-react';
import { ROLE_DETAILS, UserRole } from '@/lib/permissions';

export default function RoleSwitcher({ initialRole = 'CAMPAIGN_DIRECTOR' }: { initialRole?: UserRole }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole>(initialRole);
  const [isSwitching, setIsSwitching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const match = document.cookie.match(new RegExp('(^| )active_user_role=([^;]+)'));
    if (match && match[2] && ROLE_DETAILS[match[2] as UserRole]) {
      setActiveRole(match[2] as UserRole);
    }

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectRole = async (role: UserRole) => {
    if (role === activeRole || isSwitching) return;
    setIsSwitching(true);
    try {
      const res = await fetch('/api/roles/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        setActiveRole(role);
        setIsOpen(false);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSwitching(false);
    }
  };

  const currentRoleInfo = ROLE_DETAILS[activeRole] || ROLE_DETAILS.CAMPAIGN_DIRECTOR;
  const isSupervisor = activeRole === 'GLOBAL_SUPERVISOR';

  return (
    <div className="relative" ref={containerRef}>
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in-50 text-slate-800">
          <div className="px-3 py-1.5 border-b border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Simulador de Roles de Campaña
            </p>
            <p className="text-[11px] text-slate-500">
              Selecciona un perfil para comprobar sus permisos y restricciones en vivo:
            </p>
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            {(Object.keys(ROLE_DETAILS) as UserRole[]).map((r) => {
              const info = ROLE_DETAILS[r];
              const isSelected = r === activeRole;
              return (
                <button
                  key={r}
                  onClick={() => handleSelectRole(r)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-start justify-between transition ${
                    isSelected ? 'bg-red-50 text-red-900 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900">{info.label}</span>
                      {r === 'GLOBAL_SUPERVISOR' && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-blue-100 text-blue-700 font-bold">
                          Solo Lectura
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{info.description}</p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition group"
        title="Haz clic para cambiar de rol y probar permisos"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {isSupervisor ? (
            <Eye className="w-4 h-4 text-blue-400 shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <div className="text-xs truncate">
            <p className="font-semibold text-slate-200 truncate leading-tight">
              {currentRoleInfo.label}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {isSupervisor ? '👁️ Observador (Sin edición)' : 'Comité de Dirección'}
            </p>
          </div>
        </div>
        <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition shrink-0" />
      </button>
    </div>
  );
}
