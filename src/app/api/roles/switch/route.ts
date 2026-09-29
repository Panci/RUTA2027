import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ACTIVE_ROLE_COOKIE, ROLE_DETAILS, UserRole } from '@/lib/permissions';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    // En producción, solo un Administrador General autenticado puede simular roles
    if (process.env.NODE_ENV === 'production' && session?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'En producción, la simulación de roles está reservada exclusivamente al Administrador General.' },
        { status: 403 }
      );
    }

    const { role } = await req.json();

    if (!role || !ROLE_DETAILS[role as UserRole]) {
      return NextResponse.json({ error: 'Rol no válido.' }, { status: 400 });
    }

    cookies().set(ACTIVE_ROLE_COOKIE, role, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });

    return NextResponse.json({ success: true, role });
  } catch (err: any) {
    console.error('Error al cambiar rol:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
