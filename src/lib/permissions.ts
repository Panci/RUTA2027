

export type UserRole =
  | 'ADMIN'
  | 'GLOBAL_SUPERVISOR'
  | 'CAMPAIGN_DIRECTOR'
  | 'CANDIDATE'
  | 'COMM_LEAD'
  | 'DISTRICT_LEAD'
  | 'VOLUNTEER';

export const ROLE_DETAILS: Record<UserRole, { label: string; badge: string; color: string; description: string }> = {
  ADMIN: {
    label: 'Administrador Global',
    badge: 'ADMIN',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Control técnico total, infraestructura, altas/bajas de municipios y gestión de usuarios.',
  },
  GLOBAL_SUPERVISOR: {
    label: 'Supervisor Global (Solo Lectura)',
    badge: 'SUPERVISOR',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Acceso de lectura a todos los municipios, cuadros de mando y escrutinio. Sin permisos de edición.',
  },
  CAMPAIGN_DIRECTOR: {
    label: 'Director de Campaña Local',
    badge: 'DIRECTOR',
    color: 'bg-red-100 text-red-800 border-red-200',
    description: 'Mando operativo y estratégico total sobre el municipio asignado.',
  },
  CANDIDATE: {
    label: 'Candidato / Candidata',
    badge: 'CANDIDATO',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Vista ejecutiva, agenda de calle, mensajes fuerza y radar de rivales.',
  },
  COMM_LEAD: {
    label: 'Responsable de Comunicación',
    badge: 'COMUNICACIÓN',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Gestión de argumentarios, respuestas a ataques y monitorización de adversarios.',
  },
  DISTRICT_LEAD: {
    label: 'Responsable de Distrito',
    badge: 'DISTRITO',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    description: 'Coordinación barrial, visitas vecinales y penetración territorial en su distrito.',
  },
  VOLUNTEER: {
    label: 'Colaborador / Voluntario',
    badge: 'VOLUNTARIO',
    color: 'bg-slate-100 text-slate-800 border-slate-200',
    description: 'Ejecución de tareas de proximidad y apoyo en actos.',
  },
};

export const ACTIVE_ROLE_COOKIE = 'active_user_role';



/**
 * Permisos por rol
 */
export const permissions = {
  // ¿Puede conmutar y ver todos los municipios?
  canSwitchAllMunicipalities: (role: UserRole) => ['ADMIN', 'GLOBAL_SUPERVISOR'].includes(role),

  // ¿Puede crear o eliminar municipios?
  canManageMunicipalities: (role: UserRole) => ['ADMIN', 'CAMPAIGN_DIRECTOR'].includes(role),

  // ¿Puede crear o editar tareas y actos?
  canCreateTasks: (role: UserRole) => ['ADMIN', 'CAMPAIGN_DIRECTOR', 'COMM_LEAD', 'DISTRICT_LEAD'].includes(role),

  // ¿Puede marcar o cambiar el estado de tareas?
  canChangeTaskStatus: (role: UserRole) => role !== 'GLOBAL_SUPERVISOR',

  // ¿Puede modificar la clasificación estratégica de distritos?
  canClassifyDistricts: (role: UserRole) => ['ADMIN', 'CAMPAIGN_DIRECTOR'].includes(role),

  // ¿Puede importar resultados electorales de 2023?
  canImportResults: (role: UserRole) => ['ADMIN', 'CAMPAIGN_DIRECTOR'].includes(role),

  // ¿Puede editar la configuración oficial de la campaña?
  canEditSettings: (role: UserRole) => ['ADMIN', 'CAMPAIGN_DIRECTOR'].includes(role),

  // ¿Es un rol de solo lectura (observador)?
  isReadOnly: (role: UserRole) => role === 'GLOBAL_SUPERVISOR',
};
