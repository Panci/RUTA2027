import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSessionToken, setSessionCookie } from '@/lib/auth';
import { ACTIVE_ROLE_COOKIE, UserRole } from '@/lib/permissions';
import { ACTIVE_CAMPAIGN_COOKIE } from '@/lib/campaign-context';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Por favor, introduce el correo electrónico y la contraseña.' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas o usuario no registrado.' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas o usuario no registrado.' },
        { status: 401 }
      );
    }

    // Generar token de sesión seguro firmado
    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      campaignId: user.campaignId,
    });

    // Guardar cookie HttpOnly
    await setSessionCookie(token);

    // Sincronizar rol y municipio en cookies de conveniencia para la UI
    const cookieStore = cookies();
    cookieStore.set(ACTIVE_ROLE_COOKIE, user.role, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    if (user.campaignId) {
      cookieStore.set(ACTIVE_CAMPAIGN_COOKIE, user.campaignId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
    }

    // Registrar en auditoría
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    await prisma.auditLog.create({
      data: {
        campaignId: user.campaignId || undefined,
        userId: user.id,
        userName: user.name,
        action: 'LOGIN',
        resource: 'Autenticación',
        details: `Inicio de sesión exitoso desde IP: ${ip} con rol [${user.role}]`,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        campaignId: user.campaignId,
      },
    });
  } catch (err: any) {
    console.error('Error en login:', err);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
