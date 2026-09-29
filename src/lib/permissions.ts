

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

  // ¿Puede crear o eliminar municipios? (Solo el Administrador Global)
  canManageMunicipalities: (role: UserRole) => role === 'ADMIN',

  // ¿Puede crear o editar tareas y actos? (COMM_LEAD y VOLUNTEER en solo lectura)
  canCreateTasks: (role: UserRole) => ['ADMIN', 'CAMPAIGN_DIRECTOR', 'DISTRICT_LEAD'].includes(role),

  // ¿Puede marcar o cambiar el estado de tareas? (GLOBAL_SUPERVISOR y COMM_LEAD en solo lectura)
  canChangeTaskStatus: (role: UserRole) => !['GLOBAL_SUPERVISOR', 'COMM_LEAD'].includes(role),

  // ¿Puede modificar la clasificación estratégica de distritos?
  canClassifyDistricts: (role: UserRole) => ['ADMIN', 'CAMPAIGN_DIRECTOR'].includes(role),

  // ¿Puede importar resultados electorales de 2023?
  canImportResults: (role: UserRole) => ['ADMIN', 'CAMPAIGN_DIRECTOR'].includes(role),

  // ¿Puede editar la configuración oficial de la campaña?
  canEditSettings: (role: UserRole) => ['ADMIN', 'CAMPAIGN_DIRECTOR'].includes(role),

  // ¿Puede crear o editar reuniones de comité y actas?
  canManageMeetings: (role: UserRole) => ['ADMIN', 'CAMPAIGN_DIRECTOR'].includes(role),

  // ¿Puede ver la infraestructura técnica y despliegue Dokploy?
  canViewDevOps: (role: UserRole) => role === 'ADMIN',

  // ¿Puede crear o editar mensajes y argumentarios? (VOLUNTEER en solo lectura)
  canManageMessages: (role: UserRole) => ['ADMIN', 'CAMPAIGN_DIRECTOR', 'COMM_LEAD'].includes(role),

  // ¿Puede gestionar o marcar hitos de la hoja de ruta? (COMM_LEAD y CANDIDATE en solo lectura)
  canManageRoadmap: (role: UserRole) => ['ADMIN', 'CAMPAIGN_DIRECTOR'].includes(role),

  // ¿Puede registrar o editar movimientos en el radar de competidores? (CANDIDATE en solo lectura)
  canManageCompetitors: (role: UserRole) => ['ADMIN', 'CAMPAIGN_DIRECTOR', 'COMM_LEAD'].includes(role),

  // ¿Puede dar de alta y gestionar roles y equipo?
  canManageTeam: (role: UserRole) => ['ADMIN', 'CAMPAIGN_DIRECTOR'].includes(role),

  // ¿Puede editar objetivos políticos y prioridades? (COMM_LEAD en solo lectura)
  canManageStrategy: (role: UserRole) => ['ADMIN', 'CAMPAIGN_DIRECTOR'].includes(role),

  // ¿Puede crear o editar partidos y rivales? (COMM_LEAD en solo lectura)
  canManageParties: (role: UserRole) => ['ADMIN', 'CAMPAIGN_DIRECTOR'].includes(role),

  // ¿Puede ajustar o modificar variables de simulación electoral? (COMM_LEAD y GLOBAL_SUPERVISOR en solo lectura)
  canEditSimulation: (role: UserRole) => !['GLOBAL_SUPERVISOR', 'COMM_LEAD'].includes(role),

  // ¿Es un rol de solo lectura (observador)?
  isReadOnly: (role: UserRole) => role === 'GLOBAL_SUPERVISOR',
};

/**
 * Rutas permitidas en la barra de navegación lateral para cada perfil.
 * Oculta módulos innecesarios y protege la confidencialidad según el rol.
 */
export const ROLE_NAVIGATION_ACCESS: Record<UserRole, string[]> = {
  ADMIN: [
    '/',
    '/actos',
    '/seguimiento',
    '/informe',
    '/presentacion',
    '/resultados-2023',
    '/partidos',
    '/distritos',
    '/simulacion',
    '/diagnostico',
    '/auditoria',
    '/prioridades',
    '/hoja-de-ruta',
    '/mensajes',
    '/competidores',
    '/municipios',
    '/equipo',
    '/indicadores',
    '/configuracion',
    '/dokploy',
  ],
  GLOBAL_SUPERVISOR: [
    '/',
    '/actos',
    '/seguimiento',
    '/informe',
    '/presentacion',
    '/resultados-2023',
    '/partidos',
    '/distritos',
    '/simulacion',
    '/diagnostico',
    '/auditoria',
    '/prioridades',
    '/hoja-de-ruta',
    '/mensajes',
    '/competidores',
    '/municipios',
    '/indicadores',
    '/configuracion',
  ],
  CAMPAIGN_DIRECTOR: [
    '/',
    '/actos',
    '/seguimiento',
    '/informe',
    '/presentacion',
    '/resultados-2023',
    '/partidos',
    '/distritos',
    '/simulacion',
    '/diagnostico',
    '/auditoria',
    '/prioridades',
    '/hoja-de-ruta',
    '/mensajes',
    '/competidores',
    '/municipios',
    '/equipo',
    '/indicadores',
    '/configuracion',
  ],
  CANDIDATE: [
    '/',
    '/actos',
    '/informe',
    '/presentacion',
    '/resultados-2023',
    '/partidos',
    '/distritos',
    '/simulacion',
    '/prioridades',
    '/hoja-de-ruta',
    '/mensajes',
    '/competidores',
    '/indicadores',
  ],
  COMM_LEAD: [
    '/',
    '/actos',
    '/informe',
    '/presentacion',
    '/partidos',
    '/simulacion',
    '/prioridades',
    '/hoja-de-ruta',
    '/mensajes',
    '/competidores',
  ],
  DISTRICT_LEAD: [
    '/',
    '/actos',
    '/distritos',
    '/resultados-2023',
    '/mensajes',
    '/informe',
  ],
  VOLUNTEER: [
    '/',
    '/actos',
    '/mensajes',
  ],
};

/**
 * Comprueba si una ruta o botón del menú está autorizado y visible para un rol
 */
export function isRouteAllowedForRole(href: string, role: UserRole): boolean {
  const allowed = ROLE_NAVIGATION_ACCESS[role] || ROLE_NAVIGATION_ACCESS.CAMPAIGN_DIRECTOR;
  return allowed.includes(href);
}
