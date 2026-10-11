import { useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { api } from '@/common/lib';

import { ApiPaths } from '../models';

export function useResolveMachineShortlink() {
  const { t } = useTranslation('error');

  return useCallback(
    async (data: string, signal: AbortSignal) => {
      let shortCode: string | null;
      try {
        shortCode = new URL(data).pathname.split('/').findLast(Boolean) ?? null;
      } catch {
        shortCode = data.trim() || null;
      }

      if (!shortCode) {
        toast.error(t('badRequest'));
        return null;
      }

      try {
        const { data: machine, error } = await api.GET(
          ApiPaths.MachineController_getMachineByShortlink,
          { params: { query: { shortCode } }, signal },
        );
        if (signal.aborted) return null;
        if (machine) return machine.uuid;

        switch (error?.statusCode) {
          case 400:
            toast.error(t('badRequest'));
            break;
          case 401:
            toast.error(t('unauthorized'));
            break;
          case 403:
            toast.error(t('forbidden'));
            break;
          case 404:
            toast.error(t('notFound'));
            break;
          case 500:
            toast.error(t('internalServerError'));
            break;
          default:
            toast.error(t('generic'));
        }
      } catch {
        if (!signal.aborted) toast.error(t('generic'));
      }

      return null;
    },
    [t],
  );
}
