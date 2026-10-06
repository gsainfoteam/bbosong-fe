import { ApiPaths } from '@/@types/api-schema.ts';
import { $api } from '@/common/lib';

export function useFindMachines() {
  const { data, isError, isLoading, error } = $api.useQuery(
    'get',
    ApiPaths.MachineController_getMachines,
  );

  return { data, isError, isLoading, error };
}
