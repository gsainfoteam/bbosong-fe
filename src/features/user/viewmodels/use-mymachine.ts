import { useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { $api } from '@/common/lib';
import { ApiPaths } from '../models';

export function useMyMachine() {
  const { t } = useTranslation('error');

  const {
    data: usingMachines,
    error: usingError,
    isError: isUsingError,
    isLoading: isUsingLoading,
    refetch,
  } = $api.useQuery(
    'get',
    ApiPaths.MachineController_getUsingMachinesByUser,
    undefined,
    {
      retry(count, err) {
        return err?.statusCode === 404 || err?.statusCode === 400 ? false : count < 3;
      },
    }
  );

  const {
    data: allMachines,
    error: allError,
    isError: isAllError,
    isLoading: isAllLoading,
  } = $api.useQuery(
    'get',
    ApiPaths.MachineController_getMachines,
    undefined,
    {
      retry(count, err) {
        return err?.statusCode === 404 || err?.statusCode === 400 ? false : count < 3;
      },
    }
  );

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

  const { mutate: toggleNotification } = $api.useMutation(
    'patch',
    ApiPaths.MachineController_toggleMachineNotification,
    { onSuccess: () => refetch() }
  );

  const handleToggleNotification = useCallback(
    (machineUuid: string, currentNotifyState: boolean) => {
      toggleNotification({
        params: { path: { uuid: machineUuid } },
        body: { notifyOnCompletion: !currentNotifyState },
      });
    },
    [toggleNotification]
  );

  const mappedMachineList = useMemo(() => {
    if (!usingMachines || !allMachines) return [];

    return usingMachines.map((usage) => {
      const machineDetail = allMachines.find((m) => m.uuid === usage.machineUuid);
      
      const mappedType = (machineDetail?.type === 'DRYER' ? 'dryer' : 'washer') as 'dryer' | 'washer';
      const mappedId = machineDetail?.index ?? 0;
      const mappedLocation = (machineDetail?.location === 'B' ? 'b' : 'a') as 'a' | 'b';

      return {
        location: mappedLocation,
        machine: {
          type: mappedType,
          id: mappedId,
        },
        notification: usage.notifyOnCompletion,
        onClear: () => handleToggleNotification(usage.machineUuid, usage.notifyOnCompletion),
      };
    });
  }, [usingMachines, allMachines, handleToggleNotification]);

  return {
    mappedMachineList,
    isLoading: isUsingLoading || isAllLoading,
  };
}