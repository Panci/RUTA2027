'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Plus,
  CheckCircle2,
  Trash2,
  Users,
  Target,
  Layers,
  CheckSquare,
  Calendar,
  AlertCircle,
  X,
  ExternalLink,
  Eye,
  Search,
  UserCheck,
  UserPlus,
} from 'lucide-react';

interface CampaignCardData {
  id: string;
  name: string;
  municipality: string;
  candidacyName: string;
  partyOrCoalition: string;
  politicalGoal: string;
  electionDate: Date | string;
  createdAt: Date | string;
  _count: {
    districts: number;
    actionTasks: number;
    parties: number;
  };
  users?: {
    id: string;
    name: string;
    email: string;
  }[];
}

export default function MunicipiosClient({
  campaigns: initialCampaigns,
  activeId,
  canManage = true,
  isSuperAdmin = true,
  activeRole = 'CAMPAIGN_DIRECTOR',
}: {
  campaigns: CampaignCardData[];
  activeId: string | null;
  canManage?: boolean;
  isSuperAdmin?: boolean;
  activeRole?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldOpenCreate = searchParams?.get('crear') === 'true';

  const [campaigns, setCampaigns] = useState<CampaignCardData[]>(initialCampaigns);
  const [isModalOpen, setIsModalOpen] = useState(shouldOpenCreate);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para modal de asignación de Director de Campaña (Solo Superadmin)
  const [directorModalCampaign, setDirectorModalCampaign] = useState<CampaignCardData | null>(null);
  const [directorForm, setDirectorForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [directorSaving, setDirectorSaving] = useState(false);
  const [directorError, setDirectorError] = useState('');
  const [directorSuccess, setDirectorSuccess] = useState('');

  const filteredCampaigns = useMemo(() => {
    if (!searchTerm.trim()) return campaigns;
    const q = searchTerm.toLowerCase().trim();
    return campaigns.filter(
      (c) =>
        c.municipality.toLowerCase().includes(q) ||
        c.partyOrCoalition.toLowerCase().includes(q) ||
        c.candidacyName.toLowerCase().includes(q)
    );
  }, [campaigns, searchTerm]);

  // Form State
  const [formData, setFormData] = useState({
    municipality: '',
    candidacyName: '',
    partyOrCoalition: '',
    politicalGoal: 'GANAR',
    electionDate: '2027-05-23',
    mainAdversaries: '',
    teamDescription: '',
    availableResources: '',
  });

  const handleSelect = async (campaignId: string) => {
    if (campaignId === activeId) return;
    try {
      const res = await fetch('/api/campaigns/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (campaignId: string, municipalityName: string) => {
    if (campaigns.length <= 1) {
      alert('No puedes eliminar el único municipio registrado en la plataforma.');
      return;
    }

    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar permanentemente la campaña de "${municipalityName}" y todos sus distritos, tareas, actos y datos de escrutinio? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar el municipio.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al eliminar.');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.municipality || !formData.candidacyName || !formData.partyOrCoalition) {
      setErrorMessage('Por favor, rellena todos los campos obligatorios (*).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          name: `Campaña ${formData.municipality} 2027`,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        window.location.reload();
      } else {
        const data = await res.json();
        setErrorMessage(data.error || 'Error al crear el nuevo municipio.');
      }
    } catch (err: any) {
      setErrorMessage('Error de red al registrar la campaña.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateDirector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directorModalCampaign) return;
    if (!directorForm.name.trim() || !directorForm.email.trim() || !directorForm.password) {
      setDirectorError('Por favor completa todos los campos.');
      return;
    }
    setDirectorSaving(true);
    setDirectorError('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: directorForm.name.trim(),
          email: directorForm.email.trim().toLowerCase(),
          password: directorForm.password,
          role: 'CAMPAIGN_DIRECTOR',
          campaignId: directorModalCampaign.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDirectorError(data.error || 'Error al crear el Director de Campaña.');
        return;
      }

      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === directorModalCampaign.id
            ? {
                ...c,
                users: [{ id: data.id, name: data.name, email: data.email }],
              }
            : c
        )
      );
      setDirectorSuccess(`Director de Campaña "${data.name}" dado de alta y asignado con éxito a ${directorModalCampaign.municipality}.`);
      setDirectorModalCampaign(null);
    } catch {
      setDirectorError('Error de conexión con el servidor.');
    } finally {
      setDirectorSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-600" />
            {isSuperAdmin
              ? 'Gestión Multi-Municipio: Elecciones Municipales 2027'
              : 'Municipio y Sede de Campaña Asignada'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isSuperAdmin
              ? 'Administra de forma aislada y simultánea las campañas electorales de cada municipio y asigna a sus Directores de Campaña.'
              : 'Espacio de mando y recursos territoriales asignados a tu dirección de campaña por el Administrador Global.'}
          </p>
        </div>
        {isSuperAdmin ? (
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/equipo"
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition flex items-center gap-1.5 border border-slate-200 shadow-2xs"
              title="Ver y gestionar todos los Directores de Campaña y usuarios"
            >
              <UserCheck className="w-4 h-4 text-cyan-600" />
              <span>Directores y Equipo</span>
            </Link>
            {canManage && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                Dar de Alta Nuevo Municipio
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 text-rose-800 text-xs font-bold rounded-lg border border-rose-200/80 shrink-0">
            <span>🏛️ Municipio Asignado</span>
          </div>
        )}
      </div>

      {directorSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {directorSuccess}
          </span>
          <button onClick={() => setDirectorSuccess('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Barra de Búsqueda y Filtro de Municipios (Solo para Superadministración con múltiples campañas) */}
      {isSuperAdmin && campaigns.length > 1 && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por municipio, sigla o candidatura..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white transition"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 self-end sm:self-center font-medium">
            <span>Mostrando <strong>{filteredCampaigns.length}</strong> de <strong>{campaigns.length}</strong> municipios</span>
          </div>
        </div>
      )}

      {/* Grid de Municipios */}
      {filteredCampaigns.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="font-semibold text-sm text-slate-700">No se encontraron municipios</p>
          <p className="text-xs text-slate-400 mt-1">Prueba con otro término de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCampaigns.map((c) => {
            const isActive = c.id === activeId;

          return (
            <div
              key={c.id}
              className={`rounded-xl border transition-all relative flex flex-col justify-between bg-white ${
                isActive
                  ? 'border-red-500 ring-2 ring-red-500/20 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {c.partyOrCoalition}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-1">{c.municipality}</h2>
                    <p className="text-xs font-medium text-slate-500">{c.candidacyName}</p>
                  </div>
                  {isActive ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Activo
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSelect(c.id)}
                      className="text-[11px] font-bold text-slate-600 hover:text-red-600 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-2.5 py-1 rounded-md transition"
                    >
                      Seleccionar
                    </button>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Target className="w-3.5 h-3.5 text-slate-400" />
                      Objetivo:
                    </span>
                    <span className="font-semibold text-slate-800">{c.politicalGoal}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      Distritos configurados:
                    </span>
                    <span className="font-semibold text-slate-800">{c._count.districts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Partidos / Rivales:
                    </span>
                    <span className="font-semibold text-slate-800">{c._count.parties}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                      Tareas y Acciones:
                    </span>
                    <span className="font-semibold text-slate-800">{c._count.actionTasks}</span>
                  </div>

                  {/* Director de Campaña Asignado */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <UserCheck className="w-3.5 h-3.5 text-cyan-600" />
                      Director/a:
                    </span>
                    {c.users && c.users.length > 0 ? (
                      <span className="font-semibold text-cyan-950 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 text-[11px] truncate max-w-[150px]" title={c.users[0].email}>
                        {c.users[0].name}
                      </span>
                    ) : isSuperAdmin ? (
                      <button
                        onClick={() => {
                          setDirectorModalCampaign(c);
                          setDirectorForm({ name: '', email: '', password: '' });
                          setDirectorError('');
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-300 px-2 py-0.5 rounded transition"
                      >
                        <UserPlus className="w-3 h-3" />
                        + Asignar Director
                      </button>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Sin asignar</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="border-t border-slate-100 p-3 bg-slate-50/70 rounded-b-xl flex items-center justify-between">
                <span className="text-[11px] text-slate-600 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  Mayo 2027
                </span>

                <div className="flex items-center gap-1.5">
                  {canManage && campaigns.length > 1 && (
                    <button
                      onClick={() => handleDelete(c.id, c.municipality)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                      title="Eliminar campaña y todos sus datos asociados"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {isActive ? (
                    <span className="text-[11px] font-bold text-emerald-700 px-2 py-0.5">
                      En edición
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSelect(c.id)}
                      className="text-xs font-bold text-red-600 hover:text-red-700 px-2 py-1"
                    >
                      Entrar →
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Modal de Alta de Nuevo Municipio */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                Alta de Nueva Campaña Municipal (2027)
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Municipio *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Móstoles"
                    value={formData.municipality}
                    onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre Candidatura *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Avanza Móstoles"
                    value={formData.candidacyName}
                    onChange={(e) => setFormData({ ...formData, candidacyName: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Partido / Coalición *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Coalición Municipal Avanza"
                    value={formData.partyOrCoalition}
                    onChange={(e) => setFormData({ ...formData, partyOrCoalition: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Objetivo Político Oficial</label>
                  <select
                    value={formData.politicalGoal}
                    onChange={(e) => setFormData({ ...formData, politicalGoal: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="GANAR" className="text-slate-900 bg-white">Ganar las elecciones</option>
                    <option value="GOBERNAR" className="text-slate-900 bg-white">Gobernar</option>
                    <option value="REPRESENTACION" className="text-slate-900 bg-white">Obtener representación</option>
                    <option value="FORMAR_GOBIERNO" className="text-slate-900 bg-white">Formar parte del gobierno</option>
                    <option value="POSICIONAMIENTO" className="text-slate-900 bg-white">Posicionarse para el futuro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Adversarios Principales</label>
                <input
                  type="text"
                  placeholder="Ej: PP (Gobierno actual), PSOE, VOX"
                  value={formData.mainAdversaries}
                  onChange={(e) => setFormData({ ...formData, mainAdversaries: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Capacidad del Equipo</label>
                  <input
                    type="text"
                    placeholder="Ej: 30 voluntarios, 1 sede..."
                    value={formData.teamDescription}
                    onChange={(e) => setFormData({ ...formData, teamDescription: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Presupuesto / Recursos</label>
                  <input
                    type="text"
                    placeholder="Ej: 20.000€ aprox."
                    value={formData.availableResources}
                    onChange={(e) => setFormData({ ...formData, availableResources: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-[11px] leading-relaxed">
                ℹ️ Al crear este municipio, el sistema generará automáticamente las <strong>7 fases de la Hoja de Ruta 2026-2027</strong>. Luego podrás importar su escrutinio de 2023 desde la sección <em>Resultados 2023</em>.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-lg transition shadow-xs"
                >
                  {isSubmitting ? 'Creando Municipio...' : 'Registrar Municipio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Asignar / Dar de Alta Director de Campaña (Solo Superadmin) */}
      {directorModalCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-cyan-600" />
                  Asignar Director de Campaña
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Municipio: <strong className="text-slate-800">{directorModalCampaign.municipality}</strong>
                </p>
              </div>
              <button
                onClick={() => setDirectorModalCampaign(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {directorError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{directorError}</span>
              </div>
            )}

            <form onSubmit={handleCreateDirector} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre y Apellidos *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Laura Gómez Pérez"
                  value={directorForm.name}
                  onChange={(e) => setDirectorForm({ ...directorForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email de Acceso *</label>
                <input
                  type="email"
                  required
                  placeholder="director@municipio.es"
                  value={directorForm.email}
                  onChange={(e) => setDirectorForm({ ...directorForm, email: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Contraseña Inicial *</label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={directorForm.password}
                  onChange={(e) => setDirectorForm({ ...directorForm, password: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg text-cyan-900 text-[11px] leading-relaxed">
                ℹ️ Esta persona tendrá el rol de <strong>Director de Campaña</strong> asignado estrictamente a <strong>{directorModalCampaign.municipality}</strong>. No podrá acceder ni cambiar a otros municipios, y podrá dar de alta a su propio equipo local (Candidato/a, Comunicación, Distritos, Voluntarios).
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDirectorModalCampaign(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={directorSaving}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold rounded-lg transition shadow-xs"
                >
                  {directorSaving ? 'Creando Director...' : 'Crear y Asignar Director'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
