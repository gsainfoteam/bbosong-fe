import { useEffect, useMemo } from 'react';

import { type UseQueryResult, useQueries } from '@tanstack/react-query';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { $api } from '@/common/lib';

import { ApiPaths } from '../models';

export function useFindMachineByUuid(uuid: string) {
  const { t } = useTranslation('error');
  const { data, error, isError, isLoading } = $api.useQuery(
    'get',
    ApiPaths.MachineController_getMachine,
    { params: { path: { uuid } } },
    {
      retry(count, queryError) {
        if (queryError?.statusCode === 404 || queryError?.statusCode === 400) return false;
        return count < 3;
      },
    },
  );

  useEffect(() => {
    if (!isError) return;
    if (error?.statusCode === 401) {
      toast.error(t('unauthorized'));
    } else if (error?.statusCode === 403) {
      toast.error(t('forbidden'));
    } else if (error?.statusCode === 404) {
      toast.error(t('notFound'));
    } else if (error?.statusCode === 400) {
      toast.error(t('badRequest'));
    } else if (error?.statusCode === 500) {
      toast.error(t('internalServerError'));
    }
  }, [error, isError, t]);

  const isNotFound = useMemo(() => error?.statusCode === 404, [error?.statusCode]);

  return {
    machine: data,
    isLoading,
    isNotFound,
  };
}

export function useFindMachinesByUuids(uuids: string[]) {
  return useQueries({
    queries: uuids.map((uuid) =>
      $api.queryOptions('get', ApiPaths.MachineController_getMachine, {
        params: { path: { uuid } },
      }),
    ),
    combine: combineMachineResults,
  });
}

// combine은 참조가 고정돼야 결과가 메모이즈되므로 컴포넌트 밖에 둔다
function combineMachineResults<T extends { uuid: string }>(results: UseQueryResult<T, unknown>[]) {
  return {
    machineByUuid: new Map(
      results.flatMap((result) => (result.data ? [[result.data.uuid, result.data] as const] : [])),
    ),
    isLoading: results.some((result) => result.isLoading),
    isError: results.some((result) => result.isError),
  };
}
