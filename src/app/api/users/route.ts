import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getActiveCampaignId } from '@/lib/campaign-context';
import { getActiveRole, permissions, getCurrentUser } from '@/lib/permissions-server';
import { UserRole } from '@/lib/permissions';

const LOCAL_ROLES: UserRole[] = ['CANDIDATE', 'COMM_LEAD', 'DISTRICT_LEAD', 'VOLUNTEER'];

export async function GET() {
  try {
    const activeRole = await getActiveRole();
    if (!permissions.canManageTeam(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol actual no tiene permisos para ver o gestionar el equipo.' },
        { status: 403 }
      );
    }

    const activeCampaignId = await getActiveCampaignId();

    const whereClause = activeRole === 'ADMIN'
      ? {}
      : { campaignId: activeCampaignId };

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        campaignId: true,
        districtId: true,
        createdAt: true,
        updatedAt: true,
        campaign: {
          select: { id: true, municipality: true, candidacyName: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(users);
  } catch (err: any) {
    console.error('Error fetching users:', err);
    return NextResponse.json({ error: err.message || 'Error del servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const activeRole = await getActiveRole();
    if (!permissions.canManageTeam(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol actual no tiene permisos para dar de alta colaboradores.' },
        { status: 403 }
      );
    }

    const currentUser = await getCurrentUser();
    const activeCampaignId = await getActiveCampaignId();
    const body = await req.json();
    const { name, email, password, role, campaignId, districtId } = body;

    if (!name?.trim() || !email?.trim() || !password || !role) {
      return NextResponse.json(
        { error: 'Nombre, correo electrónico, contraseña y rol son obligatorios.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres.' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe un usuario registrado con este correo electrónico.' },
        { status: 400 }
      );
    }

    let finalCampaignId: string | null = null;

    // Reglas de negocio según quién crea el usuario:
    if (activeRole === 'CAMPAIGN_DIRECTOR') {
      // Un Director de Campaña solo puede dar de alta los roles locales de su municipio
      if (!LOCAL_ROLES.includes(role as UserRole)) {
        return NextResponse.json(
          {
            error:
              'Como Director de Campaña solo puedes dar de alta roles operativos de tu municipio (Candidata/o, Responsable de Comunicación, Responsable de Distrito o Voluntario).',
          },
          { status: 403 }
        );
      }
      if (!activeCampaignId) {
        return NextResponse.json(
          { error: 'No tienes ningún municipio o campaña asignada.' },
          { status: 400 }
        );
      }
      finalCampaignId = activeCampaignId;
    } else if (activeRole === 'ADMIN') {
      // El Administrador Global puede dar de alta cualquier rol
      if (role === 'CAMPAIGN_DIRECTOR' && !campaignId) {
        return NextResponse.json(
          { error: 'Debes asignar un municipio al Director de Campaña.' },
          { status: 400 }
        );
      }
      finalCampaignId = campaignId || (['ADMIN', 'GLOBAL_SUPERVISOR'].includes(role) ? null : activeCampaignId);
    }

    // Validar distrito si se asigna
    let finalDistrictId: string | null = null;
    if (districtId) {
      const dist = await prisma.district.findUnique({
        where: { id: districtId },
      });
      if (dist && dist.campaignId === finalCampaignId) {
        finalDistrictId = dist.id;
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role,
        campaignId: finalCampaignId,
        districtId: finalDistrictId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        campaignId: true,
        districtId: true,
        createdAt: true,
        campaign: {
          select: { id: true, municipality: true, candidacyName: true },
        },
      },
    });

    if (finalCampaignId) {
      await prisma.auditLog.create({
        data: {
          campaignId: finalCampaignId,
          userId: currentUser?.id,
          userName: currentUser?.name || 'Administrador',
          action: 'CREATE',
          resource: 'Usuarios y Accesos',
          details: `Usuario "${newUser.name}" (${newUser.role}) dado de alta por ${currentUser?.name || 'Administrador'}`,
        },
      });
    }

    return NextResponse.json(newUser, { status: 201 });
  } catch (err: any) {
    console.error('Error creating user:', err);
    return NextResponse.json({ error: err.message || 'Error al dar de alta el usuario' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const activeRole = await getActiveRole();
    if (!permissions.canManageTeam(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol actual no tiene permisos para editar usuarios.' },
        { status: 403 }
      );
    }

    const activeCampaignId = await getActiveCampaignId();
    const body = await req.json();
    const { id, name, email, password, role, districtId, campaignId } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de usuario requerido.' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    // Reglas de edición para Director de Campaña
    if (activeRole === 'CAMPAIGN_DIRECTOR') {
      if (targetUser.campaignId !== activeCampaignId) {
        return NextResponse.json(
          { error: 'No puedes modificar usuarios pertenecientes a otros municipios.' },
          { status: 403 }
        );
      }
      if (['ADMIN', 'GLOBAL_SUPERVISOR', 'CAMPAIGN_DIRECTOR'].includes(targetUser.role)) {
        return NextResponse.json(
          { error: 'No tienes permisos para modificar directores o administradores.' },
          { status: 403 }
        );
      }
      if (role && !LOCAL_ROLES.includes(role as UserRole)) {
        return NextResponse.json(
          { error: 'Solo puedes asignar roles operativos de tu municipio.' },
          { status: 403 }
        );
      }
    }

    const dataToUpdate: any = {};
    if (name?.trim()) dataToUpdate.name = name.trim();
    if (email?.trim()) {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== targetUser.email) {
        const emailExists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (emailExists) {
          return NextResponse.json({ error: 'El correo electrónico ya está en uso.' }, { status: 400 });
        }
        dataToUpdate.email = normalizedEmail;
      }
    }
    if (password && password.length >= 6) {
      dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
    }
    if (role) {
      dataToUpdate.role = role;
    }
    if (districtId !== undefined) {
      dataToUpdate.districtId = districtId || null;
    }
    if (activeRole === 'ADMIN' && campaignId !== undefined) {
      dataToUpdate.campaignId = campaignId || null;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        campaignId: true,
        districtId: true,
        updatedAt: true,
        campaign: {
          select: { id: true, municipality: true, candidacyName: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('Error updating user:', err);
    return NextResponse.json({ error: err.message || 'Error al actualizar usuario' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const activeRole = await getActiveRole();
    if (!permissions.canManageTeam(activeRole)) {
      return NextResponse.json(
        { error: 'Tu rol actual no tiene permisos para dar de baja usuarios.' },
        { status: 403 }
      );
    }

    const currentUser = await getCurrentUser();
    const activeCampaignId = await getActiveCampaignId();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de usuario requerido.' }, { status: 400 });
    }

    if (currentUser?.id === id) {
      return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta de acceso.' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    if (activeRole === 'CAMPAIGN_DIRECTOR') {
      if (targetUser.campaignId !== activeCampaignId) {
        return NextResponse.json(
          { error: 'No puedes eliminar usuarios de otros municipios.' },
          { status: 403 }
        );
      }
      if (['ADMIN', 'GLOBAL_SUPERVISOR', 'CAMPAIGN_DIRECTOR'].includes(targetUser.role)) {
        return NextResponse.json(
          { error: 'No puedes eliminar a directores o administradores.' },
          { status: 403 }
        );
      }
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting user:', err);
    return NextResponse.json({ error: err.message || 'Error al eliminar usuario' }, { status: 500 });
  }
}
