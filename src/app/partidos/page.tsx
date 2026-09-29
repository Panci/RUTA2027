import { getActiveCampaign } from '@/lib/campaign-context';
import { getActiveRole, permissions } from '@/lib/permissions-server';
import PartidosClient from './PartidosClient';

export const dynamic = 'force-dynamic';

export default async function PartidosPage() {
  const activeRole = await getActiveRole();
  const canManage = permissions.canManageParties(activeRole);

  const campaign = await getActiveCampaign({
    include: {
      parties: {
        orderBy: { votes2023: 'desc' },
      },
    },
  });

  if (!campaign) {
    return <div className="p-8 text-center text-slate-500">Campaña no disponible.</div>;
  }

  return (
    <PartidosClient
      initialParties={campaign.parties}
      municipality={campaign.municipality}
      readOnly={!canManage}
    />
  );
}
