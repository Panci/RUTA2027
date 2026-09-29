import { cookies } from 'next/headers';
import { ACTIVE_ROLE_COOKIE, ROLE_DETAILS, UserRole } from './permissions';
import { getSession, SessionUser } from './auth';

export * from './permissions';

/**
 * Obtiene el usuario autenticado actualmente desde la sesión segura
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  return getSession();
}

/**
 * Obtiene el rol activo autenticado.
 * Si el usuario es ADMIN, se le permite conmutar de rol para probar la interfaz.
 * Para el resto de usuarios, su rol está blindado por su sesión firmada.
 */
export async function getActiveRole(): Promise<UserRole> {
  const session = await getSession();

  if (session) {
    // Si el usuario autenticado es ADMIN, permitimos conmutación de prueba
    if (session.role === 'ADMIN') {
      try {
        const cookieStore = cookies();
        const cookieRole = cookieStore.get(ACTIVE_ROLE_COOKIE)?.value as UserRole;
        if (cookieRole && ROLE_DETAILS[cookieRole]) {
          return cookieRole;
        }
      } catch {}
    }
    return session.role;
  }

  try {
    const cookieStore = cookies();
    const cookieRole = cookieStore.get(ACTIVE_ROLE_COOKIE)?.value as UserRole;
    if (cookieRole && ROLE_DETAILS[cookieRole]) {
      return cookieRole;
    }
  } catch {}

  // Fallback por defecto: Director de Campaña para permitir edición completa
  return 'CAMPAIGN_DIRECTOR';
}
