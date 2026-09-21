'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, ChevronDown, Check, Plus, Settings } from 'lucide-react';
import Link from 'next/link';

interface CampaignItem {
  id: string;
  name: string;
  municipality: string;
  candidacyName: string;
  partyOrCoalition: string;
}

export default function MunicipalitySelector({
  initialActiveId,
  initialCampaigns,
}: {
  initialActiveId: string | null;
  initialCampaigns: CampaignItem[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(initialCampaigns);
  const [activeId, setActiveId] = useState<string | null>(initialActiveId);
  const [isSwitching, setIsSwitching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeCampaign = campaigns.find((c) => c.id === activeId) || campaigns[0];

  const handleSelectCampaign = async (id: string) => {
    if (id === activeId || isSwitching) return;
    setIsSwitching(true);
    try {
      const res = await fetch('/api/campaigns/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: id }),
      });

      if (res.ok) {
        setActiveId(id);
        setIsOpen(false);
        // Recargar la página actual para que todos los Server Components
        // lean los datos del nuevo municipio activo
        window.location.reload();
      }
    } catch (err) {
      console.error('Error al cambiar de municipio:', err);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition bg-white text-slate-800 shadow-xs text-xs font-semibold"
        title="Cambiar de municipio o campaña"
      >
        <MapPin className="w-4 h-4 text-red-600 shrink-0" />
        <span className="font-bold text-slate-900 truncate max-w-[170px] md:max-w-[220px]">
          {activeCampaign ? activeCampaign.municipality : 'Seleccionar Municipio'}
        </span>
        {activeCampaign && (
          <span className="hidden sm:inline text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            {activeCampaign.partyOrCoalition}
          </span>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in-50">
          <div className="px-3 py-1.5 border-b border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Municipios en Campaña (2027)
            </p>
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            {campaigns.map((c) => {
              const isCurrent = c.id === activeId;
              return (
                <button
                  key={c.id}
                  onClick={() => handleSelectCampaign(c.id)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition ${
                    isCurrent
                      ? 'bg-red-50/80 text-red-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="truncate text-slate-900 font-semibold">{c.municipality}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {c.candidacyName} • {c.partyOrCoalition}
                    </p>
                  </div>
                  {isCurrent && <Check className="w-4 h-4 text-red-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="border-t border-slate-100 mt-1 pt-1 px-1.5 space-y-0.5">
            <Link
              href="/municipios"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition font-medium"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Gestionar Municipios</span>
            </Link>
            <Link
              href="/municipios?crear=true"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Dar de alta nuevo Municipio</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
