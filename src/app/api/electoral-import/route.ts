import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getActiveCampaign } from '@/lib/campaign-context';
import { getActiveRole, permissions } from '@/lib/permissions-server';
import { getSession } from '@/lib/auth';

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
    if (!permissions.canImportResults(activeRole)) {
      return NextResponse.json(
        { error: 'No dispones de permisos para importar resultados electorales con tu rol actual.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { records } = body;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: 'No se enviaron registros válidos' }, { status: 400 });
    }

    const campaign = await getActiveCampaign();
    if (!campaign) {
      return NextResponse.json({ error: 'No existe una campaña activa para asociar los datos' }, { status: 400 });
    }

    // Ejecución atómica en una transacción con precarga en memoria para eliminar el problema N+1
    const createdCount = await prisma.$transaction(
      async (tx) => {
        // Precargar distritos y partidos existentes de la campaña en memoria
        const currentDistricts = await tx.district.findMany({
          where: { campaignId: campaign.id },
        });
        const currentParties = await tx.party.findMany({
          where: { campaignId: campaign.id },
        });

        const districtMap = new Map<string, typeof currentDistricts[0]>();
        for (const d of currentDistricts) {
          districtMap.set(d.code.toUpperCase(), d);
          districtMap.set(d.name.toUpperCase(), d);
        }

        const partyMap = new Map<string, typeof currentParties[0]>();
        for (const p of currentParties) {
          partyMap.set(p.acronym.toUpperCase(), p);
          partyMap.set(p.name.toUpperCase(), p);
        }

        let count = 0;

        for (const row of records) {
          const distKey = String(row.distrito || '').trim().toUpperCase();
          const partyKey = String(row.partido || '').trim().toUpperCase();

          if (!distKey || !partyKey) continue;

          // Buscar o crear distrito
          let district = districtMap.get(distKey);
          if (!district) {
            district = await tx.district.create({
              data: {
                campaignId: campaign.id,
                code: distKey.slice(0, 10),
                name: String(row.distrito).trim(),
                electoralRoll: Number(row.censo) || 0,
                classification: 'COMPETENCIA_ABIERTA',
              },
            });
            districtMap.set(distKey, district);
            districtMap.set(district.code.toUpperCase(), district);
          }

          // Buscar o crear partido
          let party = partyMap.get(partyKey);
          if (!party) {
            party = await tx.party.create({
              data: {
                campaignId: campaign.id,
                name: String(row.partido).trim(),
                acronym: partyKey.slice(0, 12),
                isOwnParty: false,
              },
            });
            partyMap.set(partyKey, party);
            partyMap.set(party.acronym.toUpperCase(), party);
          }

          // Upsert de resultado electoral 2023
          await tx.electionResult2023.upsert({
            where: {
              districtId_partyId: {
                districtId: district.id,
                partyId: party.id,
              },
            },
            update: {
              votes: Number(row.votos) || 0,
              census: Number(row.censo) || district.electoralRoll,
              percent: Number(row.porcentaje) || 0,
            },
            create: {
              districtId: district.id,
              partyId: party.id,
              votes: Number(row.votos) || 0,
              census: Number(row.censo) || district.electoralRoll,
              percent: Number(row.porcentaje) || 0,
            },
          });

          count++;
        }

        // Registrar en auditoría dentro de la misma transacción garantizando atomicidad
        await tx.auditLog.create({
          data: {
            campaignId: campaign.id,
            userId: session.id,
            userName: session.name,
            action: 'IMPORT',
            resource: 'Resultados Electorales 2023',
            details: `Importación electoral procesada: ${count} registros consolidados por ${session.name}`,
          },
        });

        return count;
      },
      {
        timeout: 30000, // 30 segundos de timeout para lotes grandes
      }
    );

    return NextResponse.json({ success: true, count: createdCount });
  } catch (error: any) {
    console.error('Error en importación electoral:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar la importación electoral.' },
      { status: 500 }
    );
  }
}
