import { $api } from '@/common/lib';
import { ApiPaths } from '@/@types/api-schema.ts';

export function useFindMachines() {
  const { data } = $api.useQuery('get', ApiPaths.MachineController_getMachines);

  return data;
}
