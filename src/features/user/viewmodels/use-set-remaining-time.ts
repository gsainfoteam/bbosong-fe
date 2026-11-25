import { useRef } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { $api } from '@/common/lib';

import { ApiPaths } from '../models';

/** 세탁기 화면에 보이는 남은 시간(분)의 허용 범위. 서버(bbosong-be `SetRemainingTimeReqDto`)와 같다 */
export const MIN_REMAINING_MINUTES = 1;
export const MAX_REMAINING_MINUTES = 180;

/** 입력값이 1~180 사이 정수인지 */
export function isValidRemainingMinutes(minutes: number): boolean {
  return (
    Number.isInteger(minutes) &&
    minutes >= MIN_REMAINING_MINUTES &&
    minutes <= MAX_REMAINING_MINUTES
  );
}

/** 세탁기 남은 시간을 입력(또는 수정)한다. 성공하면 `/machine` 조회를 다시 불러온다 */
export function useSetRemainingTime() {
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

  const mutation = $api.useMutation('put', ApiPaths.MachineController_setRemainingTime, {
    onSuccess: async () => {
      await refreshMachines();
      toast.success(t('remainingTime.success'));
    },
    onError: async (error) => {
      const err = error as { statusCode?: number; errorCode?: string };
      if (err?.errorCode === 'MACHINE_NOT_RUNNING') {
        await refreshMachines();
        toast.error(t('remainingTime.error.notRunning'));
      } else if (err?.errorCode === 'REMAINING_TIME_NOT_SUPPORTED') {
        toast.error(t('remainingTime.error.notSupported'));
      } else if (err?.statusCode === 403) {
        await refreshMachines();
        toast.error(t('remainingTime.error.notMine'));
      } else if (err?.statusCode === 404) {
        await refreshMachines();
        toast.error(t('remainingTime.error.notRunning'));
      } else if (err?.statusCode === 400) {
        toast.error(t('remainingTime.error.range'));
      } else if (err?.statusCode === 401) {
        toast.error(t('error:unauthorized'));
      } else if (err?.statusCode === 500) {
        toast.error(t('error:internalServerError'));
      } else {
        toast.error(t('error:generic'));
      }
    },
    onSettled: () => {
      requestInFlight.current = false;
    },
  });

  return {
    mutate: (
      variables: Parameters<typeof mutation.mutate>[0],
      options?: Parameters<typeof mutation.mutate>[1],
    ) => {
      if (requestInFlight.current) return;
      requestInFlight.current = true;
      mutation.mutate(variables, options);
    },
    isPending: mutation.isPending,
  };
}
