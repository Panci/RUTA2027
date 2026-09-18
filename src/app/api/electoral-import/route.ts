import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { records } = body;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: 'No se enviaron registros válidos' }, { status: 400 });
    }

    const campaign = await prisma.campaign.findFirst({
      include: { districts: true, parties: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'No existe una campaña activa para asociar los datos' }, { status: 400 });
    }

    // Mapeo rápido de distritos y partidos existentes
    const districtMap = new Map(campaign.districts.map((d) => [d.code.toUpperCase(), d]));
    campaign.districts.forEach((d) => districtMap.set(d.name.toUpperCase(), d));

    const partyMap = new Map(campaign.parties.map((p) => [p.acronym.toUpperCase(), p]));
    campaign.parties.forEach((p) => partyMap.set(p.name.toUpperCase(), p));

    let createdCount = 0;

    for (const row of records) {
      const distKey = String(row.distrito).trim().toUpperCase();
      const partyKey = String(row.partido).trim().toUpperCase();

      // Buscar o crear distrito
      let district = districtMap.get(distKey);
      if (!district) {
        district = await prisma.district.create({
          data: {
            campaignId: campaign.id,
            code: distKey.slice(0, 10),
            name: String(row.distrito).trim(),
            electoralRoll: row.censo || 0,
            classification: 'COMPETENCIA_ABIERTA',
          },
        });
        districtMap.set(distKey, district);
      }

      // Buscar o crear partido
      let party = partyMap.get(partyKey);
      if (!party) {
        party = await prisma.party.create({
          data: {
            campaignId: campaign.id,
            name: String(row.partido).trim(),
            acronym: partyKey.slice(0, 12),
            isOwnParty: false,
          },
        });
        partyMap.set(partyKey, party);
      }

      // Upsert de resultado electoral 2023
      await prisma.electionResult2023.upsert({
        where: {
          districtId_partyId: {
            districtId: district.id,
            partyId: party.id,
          },
        },
        update: {
          votes: row.votos,
          census: row.censo || district.electoralRoll,
          percent: row.porcentaje || 0,
        },
        create: {
          districtId: district.id,
          partyId: party.id,
          votes: row.votos,
          census: row.censo || district.electoralRoll,
          percent: row.porcentaje || 0,
        },
      });

      createdCount++;
    }

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        campaignId: campaign.id,
        userName: 'Usuario Actual',
        action: 'IMPORT',
        resource: 'Resultados Electorales 2023',
        details: `Se han importado o actualizado ${createdCount} registros electorales.`,
      },
    });

    return NextResponse.json({ success: true, count: createdCount });
  } catch (error: any) {
    console.error('Error en importación electoral:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
