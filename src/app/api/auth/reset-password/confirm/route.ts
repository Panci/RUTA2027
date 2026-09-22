import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token de restablecimiento no proporcionado o inválido.' },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe tener como mínimo 8 caracteres.' },
        { status: 400 }
      );
    }

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'El enlace de recuperación no es válido o ya fue utilizado.' },
        { status: 400 }
      );
    }

    if (resetRecord.expiresAt < new Date()) {
      // Eliminar token caducado
      await prisma.passwordResetToken.delete({ where: { id: resetRecord.id } });
      return NextResponse.json(
        { error: 'El enlace de recuperación ha caducado (validez máxima de 1 hora). Solicita uno nuevo.' },
        { status: 400 }
      );
    }

    // Hashear nueva contraseña con bcrypt
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Actualizar usuario
    await prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash },
    });

    // Eliminar todos los tokens activos de este usuario
    await prisma.passwordResetToken.deleteMany({
      where: { userId: resetRecord.userId },
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        campaignId: resetRecord.user.campaignId,
        userId: resetRecord.user.id,
        userName: resetRecord.user.name,
        action: 'PASSWORD_RESET_SUCCESS',
        resource: 'Autenticación',
        details: `Contraseña restablecida exitosamente para ${resetRecord.user.email}`,
      },
    });

    return NextResponse.json({
      ok: true,
      message: 'Contraseña actualizada con éxito. Ya puedes iniciar sesión con tu nueva clave.',
    });
  } catch (error: any) {
    console.error('Error confirming password reset:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la contraseña.' },
      { status: 500 }
    );
  }
}
