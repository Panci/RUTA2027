'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Zap,
  Users,
  Wallet,
  Layers,
  ClipboardCheck,
  Edit3,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  MapPin,
} from 'lucide-react';

interface DistrictItem {
  id: string;
  code: string;
  name: string;
}

interface DiagnosticItem {
  id: string;
  campaignId: string;
  districtId: string | null;
  situationOverview: string | null;
  citizenProblems: string | null;
  strengths: string | null;
  weaknesses: string | null;
  opportunities: string | null;
  threats: string | null;
  teamCapabilities: string | null;
  availableResources: string | null;
  district?: DistrictItem | null;
}

export default function DiagnosticoClient({
  initialDiagnostics,
  districts,
  municipalityName,
  campaignDescription,
}: {
  initialDiagnostics: DiagnosticItem[];
  districts: DistrictItem[];
  municipalityName: string;
  campaignDescription?: string;
}) {
  const [diagnostics, setDiagnostics] = useState<DiagnosticItem[]>(initialDiagnostics);
  const [selectedId, setSelectedId] = useState<string>(
    initialDiagnostics[0]?.id || 'new'
  );

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    districtId: '',
    situationOverview: '',
    citizenProblems: '',
    strengths: '',
    weaknesses: '',
    opportunities: '',
    threats: '',
    teamCapabilities: '',
    availableResources: '',
  });

  const activeDiag =
    diagnostics.find((d) => d.id === selectedId) || diagnostics[0] || null;

  const openEditModal = (diag: DiagnosticItem) => {
    setFormData({
      id: diag.id,
      districtId: diag.districtId || '',
      situationOverview: diag.situationOverview || '',
      citizenProblems: diag.citizenProblems || '',
      strengths: diag.strengths || '',
      weaknesses: diag.weaknesses || '',
      opportunities: diag.opportunities || '',
      threats: diag.threats || '',
      teamCapabilities: diag.teamCapabilities || '',
      availableResources: diag.availableResources || '',
    });
    setErrorMsg('');
    setIsEditModalOpen(true);
  };

  const openCreateModal = () => {
    setFormData({
      id: '',
      districtId: '',
      situationOverview: '',
      citizenProblems: '',
      strengths: '',
      weaknesses: '',
      opportunities: '',
      threats: '',
      teamCapabilities: '',
      availableResources: '',
    });
    setErrorMsg('');
    setIsCreateModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/diagnostics', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al actualizar el diagnóstico.');
      }

      const updated = await res.json();
      setDiagnostics((prev) =>
        prev.map((d) => (d.id === updated.id ? updated : d))
      );
      setIsEditModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al crear el diagnóstico.');
      }

      const created = await res.json();
      setDiagnostics((prev) => [...prev, created]);
      setSelectedId(created.id);
      setIsCreateModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (diagnostics.length <= 1) {
      alert('Debe mantenerse al menos un diagnóstico DAFO principal.');
      return;
    }

    if (!confirm('¿Eliminar este diagnóstico estratégico territorial?')) return;

    try {
      const res = await fetch(`/api/diagnostics?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setDiagnostics((prev) => prev.filter((d) => d.id !== id));
        const remaining = diagnostics.filter((d) => d.id !== id);
        if (remaining.length > 0) {
          setSelectedId(remaining[0].id);
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar el diagnóstico.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al eliminar.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-rose-500">
              Diagnóstico Integral
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Matriz DAFO Municipal y Territorial
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Diagnóstico de situación política, problemas ciudadanos y capacidades reales del equipo de {municipalityName}.
          </p>
        </div>

        {/* Acciones principales y navegación */}
        <div className="flex flex-wrap items-center gap-2.5 print:hidden">
          {activeDiag && (
            <button
              onClick={() => openEditModal(activeDiag)}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-2xs flex items-center gap-1.5 transition"
              title="Editar el contenido del diagnóstico activo"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar DAFO</span>
            </button>
          )}

          <button
            onClick={openCreateModal}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs flex items-center gap-1.5 transition"
            title="Crear un diagnóstico específico para un distrito o nuevo ámbito"
          >
            <Plus className="w-3.5 h-3.5 text-rose-500" />
            <span>+ Nuevo Diagnóstico</span>
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          <Link
            href="/auditoria"
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-100 flex items-center gap-1.5 transition shadow-2xs"
          >
            <ClipboardCheck className="w-4 h-4 text-rose-500" />
            <span>Auditoría (21 Preguntas)</span>
          </Link>
        </div>
      </div>

      {/* Selector de Ámbito / Pestañas de Diagnósticos */}
      {diagnostics.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {diagnostics.map((d) => {
            const isSelected = d.id === selectedId;
            const label = d.district
              ? `Distrito ${d.district.code}: ${d.district.name}`
              : 'Ámbito Municipal General';

            return (
              <button
                key={d.id}
                onClick={() => setSelectedId(d.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 border ${
                  isSelected
                    ? 'bg-rose-500 text-white border-rose-600 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Ámbito actual y botón de eliminar si procede */}
      <div className="flex items-center justify-between bg-slate-50/80 px-4 py-2.5 rounded-xl border border-slate-200/80 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <MapPin className="w-4 h-4 text-rose-500" />
          <span>
            Mostrando diagnóstico para:{' '}
            <strong className="text-slate-900">
              {activeDiag?.district
                ? `Distrito ${activeDiag.district.code} - ${activeDiag.district.name}`
                : `Todo el término municipal de ${municipalityName}`}
            </strong>
          </span>
        </div>

        {activeDiag && diagnostics.length > 1 && (
          <button
            onClick={() => handleDelete(activeDiag.id)}
            className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50 transition"
            title="Eliminar este diagnóstico territorial"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Eliminar</span>
          </button>
        )}
      </div>

      {/* Situación Política y Problemas Ciudadanos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-rose-500" />
            Situación Política del Municipio
          </span>
          <p className="text-sm text-slate-800 leading-relaxed bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70 whitespace-pre-line">
            {activeDiag?.situationOverview || campaignDescription || 'Sin situación política registrada.'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Problemas Ciudadanos Centrales
          </span>
          <p className="text-sm text-slate-800 leading-relaxed bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/60 whitespace-pre-line">
            {activeDiag?.citizenProblems || 'Sin problemas ciudadanos especificados.'}
          </p>
        </div>
      </div>

      {/* Matriz DAFO de 4 Cuadrantes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-4 h-4 text-rose-500" />
            Matriz DAFO Estratégica
          </h2>
          {activeDiag && (
            <button
              onClick={() => openEditModal(activeDiag)}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Modificar cuadrantes</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Fortalezas */}
          <div className="bg-emerald-50/60 rounded-2xl border border-emerald-200/80 p-5 space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 text-emerald-800">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <h3 className="font-bold text-sm uppercase tracking-wide">Fortalezas de la Candidatura</h3>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line bg-white/70 p-3.5 rounded-xl border border-emerald-100/90">
              {activeDiag?.strengths || 'No se han registrado fortalezas.'}
            </p>
          </div>

          {/* Debilidades */}
          <div className="bg-rose-50/60 rounded-2xl border border-rose-200/80 p-5 space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 text-rose-800">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <h3 className="font-bold text-sm uppercase tracking-wide">Debilidades a Subsanar</h3>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line bg-white/70 p-3.5 rounded-xl border border-rose-100/90">
              {activeDiag?.weaknesses || 'No se han registrado debilidades.'}
            </p>
          </div>

          {/* Oportunidades */}
          <div className="bg-sky-50/60 rounded-2xl border border-sky-200/80 p-5 space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 text-sky-800">
              <Lightbulb className="w-5 h-5 text-sky-600 shrink-0" />
              <h3 className="font-bold text-sm uppercase tracking-wide">Oportunidades del Entorno</h3>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line bg-white/70 p-3.5 rounded-xl border border-sky-100/90">
              {activeDiag?.opportunities || 'No se han registrado oportunidades.'}
            </p>
          </div>

          {/* Amenazas */}
          <div className="bg-amber-50/60 rounded-2xl border border-amber-200/80 p-5 space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 text-amber-800">
              <Zap className="w-5 h-5 text-amber-600 shrink-0" />
              <h3 className="font-bold text-sm uppercase tracking-wide">Amenazas y Riesgos Políticos</h3>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line bg-white/70 p-3.5 rounded-xl border border-amber-100/90">
              {activeDiag?.threats || 'No se han registrado amenazas.'}
            </p>
          </div>
        </div>
      </div>

      {/* Capacidades Reales y Recursos Disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600" />
            Capacidades Reales del Equipo
          </span>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70 whitespace-pre-line">
            {activeDiag?.teamCapabilities || 'Comité directivo diario, red de apoderados y colaboradores locales.'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-purple-600" />
            Recursos Disponibles
          </span>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70 whitespace-pre-line">
            {activeDiag?.availableResources || 'Sede de campaña, canales digitales y presupuesto de propaganda municipal.'}
          </p>
        </div>
      </div>

      {/* MODAL DE EDICIÓN DE DIAGNÓSTICO */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-rose-500" />
                Editar Diagnóstico DAFO
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {districts.length > 0 && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Ámbito Territorial / Distrito Asignado
                  </label>
                  <select
                    value={formData.districtId}
                    onChange={(e) => setFormData({ ...formData, districtId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  >
                    <option value="">Ámbito Municipal General (Todos los distritos)</option>
                    {districts.map((dist) => (
                      <option key={dist.id} value={dist.id}>
                        Distrito {dist.code} - {dist.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Situación Política del Municipio
                  </label>
                  <textarea
                    rows={3}
                    value={formData.situationOverview}
                    onChange={(e) => setFormData({ ...formData, situationOverview: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    placeholder="Descripción del contexto político local..."
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Problemas Ciudadanos Centrales
                  </label>
                  <textarea
                    rows={3}
                    value={formData.citizenProblems}
                    onChange={(e) => setFormData({ ...formData, citizenProblems: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    placeholder="Demandas vecinales más urgentes..."
                  />
                </div>
              </div>

              {/* Los 4 Cuadrantes DAFO */}
              <div className="border-t border-slate-100 pt-3">
                <span className="font-bold text-slate-800 block text-xs mb-2">
                  Cuadrantes de la Matriz DAFO:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-emerald-800 block mb-1">
                      Fortalezas de la Candidatura
                    </label>
                    <textarea
                      rows={3}
                      value={formData.strengths}
                      onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                      className="w-full px-3 py-2 border border-emerald-200 rounded-xl bg-emerald-50/40 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      placeholder="Implantación, candidatos, credibilidad de gestión..."
                    />
                  </div>

                  <div>
                    <label className="font-bold text-rose-800 block mb-1">
                      Debilidades a Subsanar
                    </label>
                    <textarea
                      rows={3}
                      value={formData.weaknesses}
                      onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
                      className="w-full px-3 py-2 border border-rose-200 rounded-xl bg-rose-50/40 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      placeholder="Desgaste, falta de penetración en jóvenes..."
                    />
                  </div>

                  <div>
                    <label className="font-bold text-sky-800 block mb-1">
                      Oportunidades del Entorno
                    </label>
                    <textarea
                      rows={3}
                      value={formData.opportunities}
                      onChange={(e) => setFormData({ ...formData, opportunities: e.target.value })}
                      className="w-full px-3 py-2 border border-sky-200 rounded-xl bg-sky-50/40 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                      placeholder="Descontento con el alcalde, división de los rivales..."
                    />
                  </div>

                  <div>
                    <label className="font-bold text-amber-800 block mb-1">
                      Amenazas y Riesgos Políticos
                    </label>
                    <textarea
                      rows={3}
                      value={formData.threats}
                      onChange={(e) => setFormData({ ...formData, threats: e.target.value })}
                      className="w-full px-3 py-2 border border-amber-200 rounded-xl bg-amber-50/40 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      placeholder="Alta abstención, polarización externa..."
                    />
                  </div>
                </div>
              </div>

              {/* Capacidades y Recursos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Capacidades Reales del Equipo
                  </label>
                  <textarea
                    rows={2}
                    value={formData.teamCapabilities}
                    onChange={(e) => setFormData({ ...formData, teamCapabilities: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    placeholder="Voluntariado, apoderados, presencia en redes..."
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Recursos Disponibles
                  </label>
                  <textarea
                    rows={2}
                    value={formData.availableResources}
                    onChange={(e) => setFormData({ ...formData, availableResources: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    placeholder="Locales, presupuesto, medios de difusión..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-2xs transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CREACIÓN DE NUEVO DIAGNÓSTICO */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-500" />
                Nuevo Diagnóstico DAFO Territorial
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Ámbito Territorial del Diagnóstico
                </label>
                <select
                  value={formData.districtId}
                  onChange={(e) => setFormData({ ...formData, districtId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                >
                  <option value="">Ámbito Municipal General</option>
                  {districts.map((dist) => (
                    <option key={dist.id} value={dist.id}>
                      Distrito {dist.code} - {dist.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Situación Política
                  </label>
                  <textarea
                    rows={3}
                    value={formData.situationOverview}
                    onChange={(e) => setFormData({ ...formData, situationOverview: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    placeholder="Contexto político..."
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Problemas Ciudadanos Centrales
                  </label>
                  <textarea
                    rows={3}
                    value={formData.citizenProblems}
                    onChange={(e) => setFormData({ ...formData, citizenProblems: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    placeholder="Demandas vecinales..."
                  />
                </div>
              </div>

              {/* DAFO */}
              <div className="border-t border-slate-100 pt-3">
                <span className="font-bold text-slate-800 block text-xs mb-2">
                  Cuadrantes de la Matriz DAFO:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-emerald-800 block mb-1">Fortalezas</label>
                    <textarea
                      rows={3}
                      value={formData.strengths}
                      onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                      className="w-full px-3 py-2 border border-emerald-200 rounded-xl bg-emerald-50/40 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-rose-800 block mb-1">Debilidades</label>
                    <textarea
                      rows={3}
                      value={formData.weaknesses}
                      onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
                      className="w-full px-3 py-2 border border-rose-200 rounded-xl bg-rose-50/40 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-sky-800 block mb-1">Oportunidades</label>
                    <textarea
                      rows={3}
                      value={formData.opportunities}
                      onChange={(e) => setFormData({ ...formData, opportunities: e.target.value })}
                      className="w-full px-3 py-2 border border-sky-200 rounded-xl bg-sky-50/40 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-amber-800 block mb-1">Amenazas</label>
                    <textarea
                      rows={3}
                      value={formData.threats}
                      onChange={(e) => setFormData({ ...formData, threats: e.target.value })}
                      className="w-full px-3 py-2 border border-amber-200 rounded-xl bg-amber-50/40 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Capacidades y Recursos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Capacidades Reales</label>
                  <textarea
                    rows={2}
                    value={formData.teamCapabilities}
                    onChange={(e) => setFormData({ ...formData, teamCapabilities: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Recursos Disponibles</label>
                  <textarea
                    rows={2}
                    value={formData.availableResources}
                    onChange={(e) => setFormData({ ...formData, availableResources: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-2xs transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Creando...' : 'Crear Diagnóstico'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
