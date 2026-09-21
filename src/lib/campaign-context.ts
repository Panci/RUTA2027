import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const ACTIVE_CAMPAIGN_COOKIE = 'active_campaign_id';

/**
 * Obtiene el ID del municipio/campaña activo.
 * Primero intenta leer la cookie 'active_campaign_id',
 * y si no existe o no es válida, selecciona la primera campaña disponible.
 */
export async function getActiveCampaignId(): Promise<string | null> {
  let cookieId: string | undefined;

  try {
    const cookieStore = cookies();
    cookieId = cookieStore.get(ACTIVE_CAMPAIGN_COOKIE)?.value;
  } catch {
    // Si se invoca fuera del contexto de una solicitud HTTP, se ignora la cookie
    cookieId = undefined;
  }

  if (cookieId) {
    const exists = await prisma.campaign.findUnique({
      where: { id: cookieId },
      select: { id: true },
    });
    if (exists) {
      return exists.id;
    }
  }

  const firstCampaign = await prisma.campaign.findFirst({
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });

  return firstCampaign ? firstCampaign.id : null;
}

/**
 * Obtiene los datos completos de la campaña activa según las opciones (include, select) especificadas.
 */
export async function getActiveCampaign<T extends Prisma.CampaignFindFirstArgs>(
  options?: Prisma.SelectSubset<T, Prisma.CampaignFindFirstArgs>
): Promise<Prisma.CampaignGetPayload<T> | null> {
  const activeId = await getActiveCampaignId();

  if (!activeId) {
    return null;
  }

  return prisma.campaign.findUnique({
    where: { id: activeId },
    ...(options as any),
  }) as any;
}

/**
 * Devuelve la lista de todos los municipios/campañas registradas.
 */
export async function getAllCampaigns() {
  return prisma.campaign.findMany({
    orderBy: { municipality: 'asc' },
    select: {
      id: true,
      name: true,
      municipality: true,
      candidacyName: true,
      partyOrCoalition: true,
      politicalGoal: true,
      electionDate: true,
      createdAt: true,
      _count: {
        select: {
          districts: true,
          actionTasks: true,
          parties: true,
        },
      },
    },
  });
}
