import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';
import { ACTIVE_ROLE_COOKIE } from '@/lib/permissions';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    await clearSessionCookie();
    const cookieStore = cookies();
    cookieStore.delete(ACTIVE_ROLE_COOKIE);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error en logout:', err);
    return NextResponse.json({ error: 'Error al cerrar sesión.' }, { status: 500 });
  }
}
