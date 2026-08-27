import { useEffect, useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { $api } from '@/common/lib';

import { ApiPaths } from '../models';


export function useFindMachineByUuid(uuid: string) {
  const { t } = useTranslation();
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
      toast.error(t('error.unauthorized'));
    } else if (error?.statusCode === 403) {
      toast.error(t('error.forbidden'));
    } else if (error?.statusCode === 404) {
      toast.error(t('error.notFound'));
    } else if (error?.statusCode === 500) {
      toast.error(t('error.internalServerError'));
    }
  }, [error, isError, t]);

  const isNotFound = useMemo(() => error?.statusCode === 404, [error?.statusCode]);

  return {
    machine: data,
    isLoading,
    isNotFound,
  };
}
