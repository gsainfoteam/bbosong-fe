import { useEffect, useMemo, useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { $api } from '@/common/lib';
import { resolveRemainingMinutes } from '@/common/utils';

import { ApiPaths } from '../models';
import { type LiveActivityTarget } from './live-activity-state';
import { useUnregisterMachine } from './use-unregister-machine';

export function useFindMyMachine() {
  const { t } = useTranslation('error');
  const { t: tTitle } = useTranslation(['location', 'machine']);

  const {
    data: usingMachines,
    error: usingError,
    isError: isUsingError,
    isLoading: isUsingLoading,
    refetch: refetchUsingMachines,
  } = $api.useQuery('get', ApiPaths.MachineController_getUsingMachinesByUser, undefined, {
    retry(count, err) {
      return err?.statusCode === 404 || err?.statusCode === 400 ? false : count < 3;
    },
  });

  const {
    data: allMachines,
    error: allError,
    isError: isAllError,
    isLoading: isAllLoading,
    refetch: refetchAllMachines,
  } = $api.useQuery('get', ApiPaths.MachineController_getMachines, undefined, {
    retry(count, err) {
      return err?.statusCode === 404 || err?.statusCode === 400 ? false : count < 3;
    },
  });

  const error = usingError || allError;
  const isError = isUsingError || isAllError;
  useEffect(() => {
    if (!isError) return;
    if (error?.statusCode === 401) toast.error(t('unauthorized'));
    else if (error?.statusCode === 403) toast.error(t('forbidden'));
    else if (error?.statusCode === 404) toast.error(t('notFound'));
    else if (error?.statusCode === 400) toast.error(t('badRequest'));
    else if (error?.statusCode === 500) toast.error(t('internalServerError'));
  }, [error, isError, t]);

  const { mutate: unregisterMachine, isPending: isUnregistering } = useUnregisterMachine();

  const mappedMachineList = useMemo(() => {
    if (!usingMachines || !allMachines) return [];

    const machineByUuid = new Map(allMachines.map((m) => [m.uuid, m]));

    return usingMachines.flatMap((usage) => {
      const machineDetail = machineByUuid.get(usage.machineUuid);
      if (!machineDetail) return [];

      const mappedType = (machineDetail.type === 'DRYER' ? 'dryer' : 'washer') as
        'dryer' | 'washer';
      const mappedId = machineDetail.index;
      const mappedLocation = (machineDetail.location === 'B' ? 'b' : 'a') as 'a' | 'b';

      return [
        {
          location: mappedLocation,
          machine: {
            type: mappedType,
            id: mappedId,
          },
          notification: usage.notifyOnCompletion,
          onUnregister: () => unregisterMachine({ params: { path: { uuid: usage.machineUuid } } }),
          isUnregistering,
        },
      ];
    });
  }, [usingMachines, allMachines, unregisterMachine, isUnregistering]);

  // 건조기는 기계 목록의 ThinQ 값으로 남은 시간을 보여주고, 세탁기는 남은 시간이 없어 경과 시간을 보여준다
  const liveActivityTargets = useMemo<LiveActivityTarget[]>(() => {
    if (!usingMachines || !allMachines) return [];

    const machineByUuid = new Map(allMachines.map((m) => [m.uuid, m]));

    return usingMachines.flatMap((usage) => {
      const machine = machineByUuid.get(usage.machineUuid);
      if (!machine) return [];

      // t('location:a')
      // t('location:b')
      // t('machine:dryer')
      // t('machine:washer')
      // t('machine:count')
      const location = machine.location === 'B' ? 'b' : 'a';
      const kind = machine.type === 'DRYER' ? 'DRYER' : 'WASHER';
      const title = `${tTitle(`location:${location}`)} ${tTitle(kind === 'DRYER' ? 'machine:dryer' : 'machine:washer')} ${tTitle('machine:count', { id: String(machine.index) })}`;
      const remainingMinutes = resolveRemainingMinutes(machine);

      return [
        {
          machineUuid: machine.uuid,
          kind,
          title,
          startedAt: usage.startedAt,
          status: machine.status,
          thinqCurrentState:
            typeof machine.thinqCurrentState === 'string' ? machine.thinqCurrentState : null,
          remainingMinutes,
          thinqUpdatedAt: machine.thinqUpdatedAt,
        },
      ];
    });
  }, [usingMachines, allMachines, tTitle]);

  const refetchMachines = useCallback(
    () => Promise.all([refetchUsingMachines(), refetchAllMachines()]),
    [refetchUsingMachines, refetchAllMachines],
  );

  return {
    data: mappedMachineList,
    liveActivityTargets,
    isLoading: isUsingLoading || isAllLoading,
    isError,
    refetch: refetchMachines,
  };
}
