import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getActiveRole, permissions } from '@/lib/permissions-server';
import { getSession } from '@/lib/auth';
import { getActiveCampaignId } from '@/lib/campaign-context';
import { DistrictClassificationSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere iniciar sesión.' },
        { status: 401 }
      );
    }

    const activeRole = await getActiveRole();
    if (!permissions.canClassifyDistricts(activeRole)) {
      return NextResponse.json(
        { error: 'No tienes permisos para reclasificar distritos con tu rol actual.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parseResult = DistrictClassificationSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Datos de clasificación no válidos.' },
        { status: 400 }
      );
    }

    const { districtId, classification } = parseResult.data;
    const campaignId = await getActiveCampaignId();

    // Aislamiento multi-inquilino: verificar existencia y pertenencia a la campaña activa
    const existingDistrict = await prisma.district.findUnique({
      where: { id: districtId },
      select: { id: true, campaignId: true, name: true, classification: true },
    });

    if (!existingDistrict || (campaignId && existingDistrict.campaignId !== campaignId)) {
      return NextResponse.json(
        { error: 'Distrito no encontrado o no pertenece a la campaña activa.' },
        { status: 404 }
      );
    }

    const updated = await prisma.district.update({
      where: { id: districtId },
      data: { classification },
    });

    await prisma.auditLog.create({
      data: {
        campaignId: updated.campaignId,
        userId: session.id,
        userName: session.name,
        action: 'UPDATE',
        resource: 'Distritos',
        details: `Clasificación del distrito "${updated.name}" actualizada de [${existingDistrict.classification}] a [${classification}] por ${session.name}`,
      },
    });

    return NextResponse.json({ success: true, district: updated });
  } catch (error: any) {
    console.error('Error al clasificar distrito:', error);
    return NextResponse.json(
      { error: 'Error interno al actualizar la clasificación del distrito.' },
      { status: 500 }
    );
  }
}
