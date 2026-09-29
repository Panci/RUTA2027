import { getActiveCampaign } from '@/lib/campaign-context';
import { getActiveRole, permissions } from '@/lib/permissions-server';
import PrioridadesClient from './PrioridadesClient';

export const dynamic = 'force-dynamic';

export default async function PrioridadesPage() {
  const activeRole = await getActiveRole();
  const canManage = permissions.canManageStrategy(activeRole);

  const campaign = await getActiveCampaign({
    include: {
      strategy: true,
      priorities: {
        include: {
          actionTasks: {
            include: { district: true },
          },
        },
        orderBy: { orderNumber: 'asc' },
      },
    },
  });

  if (!campaign) {
    return <div className="p-8 text-center text-slate-500">Campaña no disponible.</div>;
  }

  return (
    <PrioridadesClient
      initialStrategy={campaign.strategy}
      initialPriorities={campaign.priorities}
      municipalityName={campaign.municipality}
      politicalGoal={campaign.politicalGoal}
      readOnly={!canManage}
    />
  );
}
