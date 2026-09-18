import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { districtId, classification } = body;

    if (!districtId || !classification) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const updated = await prisma.district.update({
      where: { id: districtId },
      data: { classification },
    });

    await prisma.auditLog.create({
      data: {
        campaignId: updated.campaignId,
        userName: 'Director de Campaña',
        action: 'UPDATE',
        resource: 'Distritos',
        details: `Clasificación del distrito ${updated.name} actualizada a ${classification}`,
      },
    });

    return NextResponse.json({ success: true, district: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
