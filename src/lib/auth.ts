import { cookies } from 'next/headers';
import { UserRole } from './permissions';

export const AUTH_SESSION_COOKIE = 'auth_session';

function getSessionSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'CONFIGURACIÓN CRÍTICA REQUERIDA: NEXTAUTH_SECRET o AUTH_SECRET debe estar configurada en el entorno de producción.'
      );
    }
    return 'ruta2027-secret-key-security-audit-token-32b';
  }
  return secret;
}

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  campaignId: string | null;
  exp: number;
}

// Codificador Base64URL
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

// Firma HMAC-SHA256 con Web Crypto API (compatible con Node.js y Next.js Middleware)
async function sign(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return Buffer.from(signature)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// Verifica la firma HMAC-SHA256
async function verify(data: string, signature: string, secret: string): Promise<boolean> {
  const expectedSignature = await sign(data, secret);
  return expectedSignature === signature;
}

/**
 * Genera un token de sesión firmado criptográficamente
 */
export async function createSessionToken(user: Omit<SessionUser, 'exp'>): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const payload: SessionUser = { ...user, exp };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await sign(encodedPayload, getSessionSecret());
  return `${encodedPayload}.${signature}`;
}

/**
 * Valida un token de sesión y devuelve los datos del usuario o null si es inválido
 */
export async function verifySessionToken(token?: string | null): Promise<SessionUser | null> {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, signature] = parts;
  const isValid = await verify(encodedPayload, signature, getSessionSecret());
  if (!isValid) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionUser;
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Sesión expirada
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Obtiene la sesión actual desde las cookies en Server Components / Server Actions
 */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_SESSION_COOKIE)?.value;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Guarda la cookie de sesión firmada
 */
export async function setSessionCookie(token: string) {
  cookies().set(AUTH_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

/**
 * Elimina la cookie de sesión al cerrar sesión
 */
export async function clearSessionCookie() {
  cookies().delete(AUTH_SESSION_COOKIE);
}


