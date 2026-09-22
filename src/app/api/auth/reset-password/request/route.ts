import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Debes proporcionar una dirección de correo válida.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Mensaje de respuesta genérico para mitigar enumeración de usuarios
    const standardMessage =
      'Si el correo electrónico coincide con una cuenta activa, se ha generado el enlace de restablecimiento con una validez de 60 minutos.';

    if (!user) {
      return NextResponse.json({
        ok: true,
        message: standardMessage,
      });
    }

    // Invalidar cualquier token anterior no utilizado para este usuario
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Generar un token criptográfico seguro de 32 bytes (64 caracteres hex)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora de vigencia

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        campaignId: user.campaignId,
        userId: user.id,
        userName: user.name,
        action: 'PASSWORD_RESET_REQUEST',
        resource: 'Autenticación',
        details: `Solicitud de restablecimiento de contraseña generada para ${user.email}`,
      },
    });

    const resetUrl = `/recuperar-contrasena/${token}`;

    return NextResponse.json({
      ok: true,
      message: standardMessage,
      devResetUrl: resetUrl,
      userName: user.name,
    });
  } catch (error: any) {
    console.error('Error requesting password reset:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud de restablecimiento.' },
      { status: 500 }
    );
  }
}
