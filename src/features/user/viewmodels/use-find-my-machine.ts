import { useEffect, useMemo, useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { $api } from '@/common/lib';
import { resolveRemainingMinutes } from '@/common/utils';

import { ApiPaths } from '../models';
import { type LiveActivityTarget } from './live-activity-state';
import { useSetRemainingTime } from './use-set-remaining-time';
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
  const { mutate: setRemainingTime, isPending: isSettingRemainingTime } = useSetRemainingTime();

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
          machineUuid: usage.machineUuid,
          location: mappedLocation,
          machine: {
            type: mappedType,
            id: mappedId,
          },
          notification: usage.notifyOnCompletion,
          onUnregister: () => unregisterMachine({ params: { path: { uuid: usage.machineUuid } } }),
          isUnregistering,
          onSetRemainingTime: (remainingMinutes: number, onSuccess: () => void) =>
            setRemainingTime(
              { params: { path: { uuid: usage.machineUuid } }, body: { remainingMinutes } },
              { onSuccess },
            ),
          isSettingRemainingTime,
        },
      ];
    });
  }, [
    usingMachines,
    allMachines,
    unregisterMachine,
    isUnregistering,
    setRemainingTime,
    isSettingRemainingTime,
  ]);

  // 건조기는 기계 목록의 ThinQ 값으로, 세탁기는 사용자가 입력한 종료 예정 시각으로 남은 시간을 보여준다. 입력이 없으면 경과 시간을 보여준다
  const liveActivityTargets = useMemo<LiveActivityTarget[]>(() => {
    if (!usingMachines || !allMachines) return [];

    const machineByUuid = new Map(allMachines.map((m) => [m.uuid, m]));

    return usingMachines.flatMap((usage) => {
      const machine = machineByUuid.get(usage.machineUuid);
      if (!machine) return [];

      const location = machine.location === 'B' ? tTitle('location:b') : tTitle('location:a');
      const kind = machine.type === 'DRYER' ? 'DRYER' : 'WASHER';
      const title = `${location} ${kind === 'DRYER' ? tTitle('machine:dryer') : tTitle('machine:washer')} ${tTitle('machine:count', { id: String(machine.index) })}`;
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
          estimatedEndsAt:
            kind === 'WASHER' ? (machine.currentUsage?.estimatedEndsAt ?? null) : null,
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
