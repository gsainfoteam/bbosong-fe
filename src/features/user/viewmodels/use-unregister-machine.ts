import { useRef } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { $api } from '@/common/lib';

import { ApiPaths } from '../models';

export function useUnregisterMachine(onUnregistered?: () => void) {
  const { t } = useTranslation(['machineRegister', 'error']);

  const queryClient = useQueryClient();
  const requestInFlight = useRef(false);
  const refreshMachines = () =>
    queryClient.invalidateQueries({
      predicate: ({ queryKey }) =>
        queryKey[0] === 'get' &&
        typeof queryKey[1] === 'string' &&
        queryKey[1].startsWith('/machine'),
    });
  const onSuccess = async (data: { success: boolean }) => {
    if (!data.success) {
      toast.error(t('error:generic'));
      return;
    }
    await refreshMachines();
    toast.success(t('unregister.success'));
    onUnregistered?.();
  };
  const onError = async (error: unknown) => {
    const err = error as {
      statusCode?: number;
      message?: string;
      errorCode?: string;
    };
    if (err?.statusCode === 404) {
      // 기기가 이미 종료됐거나 내가 등록한 사용이 아니므로 최신 상태로 맞춘다.
      await refreshMachines();
      toast.error(t('unregister.error.notRegistered'));
    } else if (err?.statusCode === 401) {
      toast.error(t('error:unauthorized'));
    } else if (err?.statusCode === 500) {
      toast.error(t('error:internalServerError'));
    } else {
      toast.error(t('error:generic'));
    }
  };
  const onSettled = () => {
    requestInFlight.current = false;
  };

  const unregistration = $api.useMutation(
    'delete',
    ApiPaths.MachineController_unregisterMachineUsage,
    { onSuccess, onError, onSettled },
  );

  return {
    mutate: (variables: Parameters<typeof unregistration.mutate>[0]) => {
      if (requestInFlight.current) return;
      requestInFlight.current = true;
      unregistration.mutate(variables);
    },
    isPending: unregistration.isPending,
  };
}
