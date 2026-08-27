import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { $api } from '@/common/lib';

import { ApiPaths } from '../models';

export function useRegisterMachine() {
  const { t } = useTranslation();

  return $api.useMutation('post', ApiPaths.MachineController_registerMachineUsage, {
    onSuccess: (data) => {
      if (!data.success) {
        toast.error(t('machineRegister.error.alreadyUsing'));
      }
    },
    onError: (error) => {
      const err = error as { statusCode?: number };
      if (err?.statusCode === 404) {
        toast.error(t('machineRegister.error.alreadyUsing'));
      } else if (err?.statusCode === 401) {
        toast.error(t('error.unauthorized'));
      } else if (err?.statusCode === 403) {
        toast.error(t('error.forbidden'));
      } else if (err?.statusCode === 500) {
        toast.error(t('error.internalServerError'));
      }
    },
  });
}
