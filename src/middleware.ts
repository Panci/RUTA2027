import { NextRequest, NextResponse } from 'next/server';
import { AUTH_SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

// Rutas públicas que no requieren autenticación
const PUBLIC_PATHS = [
  '/login',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/health',
  '/privacidad',
  '/aviso-legal',
  '/favicon.ico',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Permitir archivos estáticos de Next.js
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Comprobar si la ruta es pública
  const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path));

  const sessionCookie = req.cookies.get(AUTH_SESSION_COOKIE)?.value;
  const session = await verifySessionToken(sessionCookie);

  // Si el usuario está en /login y ya tiene sesión válida, redirigir al panel principal
  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Si la ruta es pública, permitir continuar
  if (isPublic) {
    return NextResponse.next();
  }

  // Si no hay sesión válida y la ruta es privada:
  if (!session) {
    // Si es una llamada a la API, responder 401 Unauthorized
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'No autorizado. Se requiere iniciar sesión.' }, { status: 401 });
    }

    // Si es una página web, redirigir a /login
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si todo es correcto, continuar
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas excepto _next/static, _next/image, favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
