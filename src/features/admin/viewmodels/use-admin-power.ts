import { $api } from '@/common/lib';

import { ApiPaths } from '../models';

export function useAdminPower(uuid: string, startedAt?: string) {
  return $api.useQuery(
    'get',
    ApiPaths.MachineController_getMachinePower,
    {
      params: { path: { uuid }, query: { startedAt } },
    },
    { enabled: !!uuid, retry: false },
  );
}
