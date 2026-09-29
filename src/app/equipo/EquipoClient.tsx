'use client';

import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  Plus,
  Pencil,
  Trash2,
  X,
  Shield,
  Megaphone,
  MapPin,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  Eye,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { ROLE_DETAILS, UserRole } from '@/lib/permissions';

interface DistrictOption {
  id: string;
  code: string;
  name: string;
}

interface CampaignOption {
  id: string;
  municipality: string;
  candidacyName: string;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  campaignId: string | null;
  districtId: string | null;
  createdAt: string | Date;
  campaign?: {
    id: string;
    municipality: string;
    candidacyName: string;
  } | null;
}

const LOCAL_ROLE_OPTIONS: { role: UserRole; label: string; desc: string }[] = [
  {
    role: 'CANDIDATE',
    label: 'Candidata / Candidato',
    desc: 'Vista ejecutiva, agenda de calle, mensajes y radar de competidores en modo consulta.',
  },
  {
    role: 'COMM_LEAD',
    label: 'Responsable de Comunicación',
    desc: 'Gestión completa del banco de mensajes y radar de competidores.',
  },
  {
    role: 'DISTRICT_LEAD',
    label: 'Responsable de Distrito',
    desc: 'Coordinación barrial, visitas vecinales y penetración en su distrito asignado.',
  },
  {
    role: 'VOLUNTEER',
    label: 'Colaborador / Voluntario',
    desc: 'Ejecución de tareas de proximidad y apoyo en actos públicos.',
  },
];

const ADMIN_ROLE_OPTIONS: { role: UserRole; label: string; desc: string }[] = [
  {
    role: 'CAMPAIGN_DIRECTOR',
    label: 'Director de Campaña Local',
    desc: 'Mando operativo y estratégico total sobre el municipio asignado, con capacidad de dar de alta al equipo local.',
  },
  {
    role: 'GLOBAL_SUPERVISOR',
    label: 'Supervisor Global (Solo Lectura)',
    desc: 'Acceso de lectura a todos los municipios y cuadros de mando sin edición.',
  },
  {
    role: 'ADMIN',
    label: 'Administrador Global',
    desc: 'Control técnico total, infraestructura, altas/bajas de municipios y usuarios.',
  },
  ...LOCAL_ROLE_OPTIONS,
];

export default function EquipoClient({
  initialUsers,
  activeCampaign,
  allCampaigns,
  activeRole,
  isAdmin = false,
}: {
  initialUsers: UserItem[];
  activeCampaign: any;
  allCampaigns: CampaignOption[];
  activeRole: UserRole;
  isAdmin?: boolean;
}) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Create Form State
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: (isAdmin ? 'CAMPAIGN_DIRECTOR' : 'VOLUNTEER') as UserRole,
    campaignId: activeCampaign?.id || '',
    districtId: '',
  });

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'VOLUNTEER' as UserRole,
    districtId: '',
    campaignId: '',
  });

  const availableRoles = isAdmin ? ADMIN_ROLE_OPTIONS : LOCAL_ROLE_OPTIONS;
  const districts: DistrictOption[] = activeCampaign?.districts || [];

  const handleOpenCreate = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setCreateForm({
      name: '',
      email: '',
      password: '',
      role: isAdmin ? 'CAMPAIGN_DIRECTOR' : 'VOLUNTEER',
      campaignId: activeCampaign?.id || '',
      districtId: '',
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (user: UserItem) => {
    setErrorMsg('');
    setSuccessMsg('');
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      districtId: user.districtId || '',
      campaignId: user.campaignId || '',
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password) {
      setErrorMsg('Por favor completa el nombre, correo y contraseña.');
      return;
    }

    if (createForm.password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Error al dar de alta al usuario.');
        return;
      }

      setUsers((prev) => [data, ...prev]);
      setIsCreateOpen(false);
      setSuccessMsg(`Usuario ${data.name} creado correctamente.`);
    } catch {
      setErrorMsg('Error de conexión con el servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setErrorMsg('');

    setIsSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUser.id,
          name: editForm.name,
          email: editForm.email,
          role: editForm.role,
          districtId: editForm.districtId,
          campaignId: isAdmin ? editForm.campaignId : undefined,
          password: editForm.password || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Error al actualizar usuario.');
        return;
      }

      setUsers((prev) => prev.map((u) => (u.id === data.id ? data : u)));
      setEditingUser(null);
      setSuccessMsg(`Usuario ${data.name} actualizado correctamente.`);
    } catch {
      setErrorMsg('Error de conexión con el servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, userName: string) => {
    if (!confirm(`¿Estás seguro de que deseas revocar el acceso a "${userName}"?`)) {
      return;
    }

    setIsDeletingId(id);
    try {
      const res = await fetch(`/api/users?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        setSuccessMsg(`Acceso de ${userName} eliminado.`);
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar el usuario.');
      }
    } catch {
      alert('Error de conexión al eliminar.');
    } finally {
      setIsDeletingId(null);
    }
  };

  // Contadores por rol
  const totalCount = users.length;
  const candidateCount = users.filter((u) => u.role === 'CANDIDATE').length;
  const commCount = users.filter((u) => u.role === 'COMM_LEAD').length;
  const districtCount = users.filter((u) => u.role === 'DISTRICT_LEAD').length;
  const volunteerCount = users.filter((u) => u.role === 'VOLUNTEER').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 text-xs font-bold uppercase tracking-wider">
            <UserCheck className="w-3.5 h-3.5 text-cyan-600" />
            <span>Gestión de Roles y Colaboradores</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">
            {isAdmin
              ? 'Usuarios y Accesos del Sistema Multi-Municipio'
              : `Equipo y Colaboradores de ${activeCampaign?.municipality || 'la Campaña'}`}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isAdmin
              ? 'Alta y asignación de Directores de Campaña a sus respectivos municipios y supervisión global.'
              : `Como Director de Campaña, puedes dar de alta directamente al resto de roles (Candidata/o, Comunicación, Responsables de Distrito y Voluntarios) para ${activeCampaign?.municipality}.`}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Dar de alta Colaborador / Rol</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {successMsg}
          </span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards de Resumen del Equipo */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Total Equipo
          </span>
          <span className="text-2xl font-black text-slate-900 block">{totalCount}</span>
          <span className="text-[11px] text-slate-500">accesos registrados</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-emerald-600 block tracking-wider">
            Candidatura
          </span>
          <span className="text-2xl font-black text-slate-900 block">{candidateCount}</span>
          <span className="text-[11px] text-slate-500">candidata/o activo</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-amber-600 block tracking-wider">
            Comunicación
          </span>
          <span className="text-2xl font-black text-slate-900 block">{commCount}</span>
          <span className="text-[11px] text-slate-500">relato y medios</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-cyan-600 block tracking-wider">
            Distritos
          </span>
          <span className="text-2xl font-black text-slate-900 block">{districtCount}</span>
          <span className="text-[11px] text-slate-500">coord. territorial</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-600 block tracking-wider">
            Voluntarios
          </span>
          <span className="text-2xl font-black text-slate-900 block">{volunteerCount}</span>
          <span className="text-[11px] text-slate-500">apoyo de calle</span>
        </div>
      </div>

      {/* Lista de Usuarios Registrados */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-rose-500" />
            <span>Colaboradores y Roles Activos</span>
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            {users.length} miembros registrados
          </span>
        </div>

        {users.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700">No hay usuarios dados de alta</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Utiliza el botón de arriba para registrar a los miembros de tu equipo con sus respectivos roles.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Nombre y Contacto</th>
                  <th className="p-3.5">Rol de Campaña</th>
                  <th className="p-3.5">Municipio Asignado</th>
                  <th className="p-3.5">Distrito</th>
                  <th className="p-3.5">Fecha Alta</th>
                  <th className="p-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const roleCfg = ROLE_DETAILS[u.role] || {
                    label: u.role,
                    color: 'bg-slate-100 text-slate-700 border-slate-200',
                  };
                  const assignedDistrict = districts.find((d) => d.id === u.districtId);

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 text-xs">{u.name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{u.email}</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border inline-block ${roleCfg.color}`}
                        >
                          {roleCfg.label}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="font-medium text-slate-800">
                          {u.campaign?.municipality || 'Ámbito Global'}
                        </div>
                        {u.campaign?.candidacyName && (
                          <div className="text-[10px] text-slate-400">
                            {u.campaign.candidacyName}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 text-slate-600">
                        {assignedDistrict ? (
                          <span className="font-medium flex items-center gap-1 text-slate-700">
                            <MapPin className="w-3 h-3 text-rose-500" />
                            {assignedDistrict.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      <td className="p-3.5 text-slate-400 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                            title="Editar usuario y rol"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(u.id, u.name)}
                            disabled={isDeletingId === u.id}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-50"
                            title="Dar de baja usuario"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Dar de Alta Nuevo Colaborador / Rol */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-rose-500" />
                <span>Dar de Alta Nuevo Colaborador</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Laura Martínez Sánchez"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Correo Electrónico (Usuario de Acceso)</label>
                <input
                  type="email"
                  required
                  placeholder="laura.martinez@campana2027.es"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Contraseña Inicial de Acceso</label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Rol en la Campaña</label>
                <select
                  value={createForm.role}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, role: e.target.value as UserRole })
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {availableRoles.map((r) => (
                    <option key={r.role} value={r.role}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  {availableRoles.find((r) => r.role === createForm.role)?.desc}
                </p>
              </div>

              {/* Si es Super Administrador y crea Director de Campaña, selecciona el municipio */}
              {isAdmin && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Municipio Asignado</label>
                  <select
                    value={createForm.campaignId}
                    onChange={(e) => setCreateForm({ ...createForm, campaignId: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Sin municipio (Ámbito Global)</option>
                    {allCampaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.municipality} ({c.candidacyName})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Si es Responsable de Distrito, selecciona el distrito */}
              {createForm.role === 'DISTRICT_LEAD' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Distrito Coordinado</label>
                  <select
                    value={createForm.districtId}
                    onChange={(e) => setCreateForm({ ...createForm, districtId: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Selecciona un distrito...</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-bold shadow-xs transition disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : 'Dar de Alta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Colaborador / Rol */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Pencil className="w-5 h-5 text-rose-500" />
                <span>Editar Acceso: {editingUser.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nueva Contraseña (dejar en blanco para no modificarla)
                </label>
                <input
                  type="password"
                  placeholder="Solo si deseas cambiarla"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Rol</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {availableRoles.map((r) => (
                    <option key={r.role} value={r.role}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {editForm.role === 'DISTRICT_LEAD' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Distrito Coordinado</label>
                  <select
                    value={editForm.districtId}
                    onChange={(e) => setEditForm({ ...editForm, districtId: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Selecciona un distrito...</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isAdmin && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Municipio Asignado</label>
                  <select
                    value={editForm.campaignId}
                    onChange={(e) => setEditForm({ ...editForm, campaignId: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Sin municipio (Ámbito Global)</option>
                    {allCampaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.municipality} ({c.candidacyName})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-bold shadow-xs transition disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
