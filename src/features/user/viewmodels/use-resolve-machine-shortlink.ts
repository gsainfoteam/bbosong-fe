import { useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { api } from '@/common/lib';

import { ApiPaths } from '../models';
import { extractMachineShortCodeFromQr } from './normalize-qr-scan-url';

export function useResolveMachineShortlink() {
  const { t } = useTranslation('error');

  return useCallback(
    async (data: string, signal: AbortSignal) => {
      const shortCode = extractMachineShortCodeFromQr(data);

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
            toast.error(
              error?.message === 'Machine gender does not match user gender.'
                ? t('genderMismatch')
                : t('forbidden'),
            );
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
