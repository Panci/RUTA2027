import { cookies } from 'next/headers';
import { ACTIVE_ROLE_COOKIE, ROLE_DETAILS, UserRole } from './permissions';

export * from './permissions';

/**
 * Obtiene el rol activo simulado o de sesión (por defecto: CAMPAIGN_DIRECTOR)
 * Solo ejecutable en entorno servidor (Server Components, Route Handlers, Server Actions).
 */
export async function getActiveRole(): Promise<UserRole> {
  try {
    const cookieStore = cookies();
    const cookieRole = cookieStore.get(ACTIVE_ROLE_COOKIE)?.value as UserRole;
    if (cookieRole && ROLE_DETAILS[cookieRole]) {
      return cookieRole;
    }
  } catch {
    // Si se ejecuta fuera de contexto de solicitud
  }
  return 'CAMPAIGN_DIRECTOR';
}
