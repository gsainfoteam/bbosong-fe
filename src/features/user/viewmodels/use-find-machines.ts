import { $api } from '@/common/lib';

import { ApiPaths } from '../models';

export function useFindMachines() {
  const { data, isError, isLoading, error, refetch } = $api.useQuery(
    'get',
    ApiPaths.MachineController_getMachines,
  );

  return { data, isError, isLoading, error, refetch };
}
