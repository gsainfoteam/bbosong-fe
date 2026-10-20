import { useQueryClient } from '@tanstack/react-query';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { $api } from '@/common/lib';

import { ApiPaths } from '../models';

export function useAdminActions() {
  const client = useQueryClient();
  const { t } = useTranslation('admin');
  const options = {
    onSuccess: async () => {
      toast.success(t('saved'));
      await Promise.all([
        client.invalidateQueries({ queryKey: ['get', ApiPaths.MachineController_getMachines] }),
        client.invalidateQueries({
          queryKey: ['get', ApiPaths.MachineController_getLaundryRoomStatus],
        }),
        client.invalidateQueries({ queryKey: ['get', ApiPaths.MachineController_getMachine] }),
      ]);
    },
    onError: (error: unknown) => {
      const status = (error as { statusCode?: number })?.statusCode;
      toast.error(
        status === 409
          ? t('conflict')
          : status === 403
            ? t('forbidden')
            : status === 404
              ? t('notFound')
              : status === 400
                ? t('badRequest')
                : t('requestFailed'),
      );
    },
  };
  const create = $api.useMutation('post', ApiPaths.MachineController_createMachine, options);
  const createMultiple = $api.useMutation(
    'post',
    ApiPaths.MachineController_createMultipleMachines,
    options,
  );
  const update = $api.useMutation('patch', ApiPaths.MachineController_updateMachine, options);
  const remove = $api.useMutation('delete', ApiPaths.MachineController_deleteMachine, options);
  const commission = $api.useMutation(
    'post',
    ApiPaths.MachineController_commissionMachine,
    options,
  );
  const ensureLink = $api.useMutation(
    'post',
    ApiPaths.MachineController_ensureMachineLink,
    options,
  );
  const backfill = $api.useMutation(
    'post',
    ApiPaths.MachineController_backfillMachineLinks,
    options,
  );
  const updateRole = $api.useMutation('post', ApiPaths.AuthController_updateRole, {
    ...options,
    onSuccess: async () => {
      toast.success(t('saved'));
      await client.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
  const isPending = [
    create,
    createMultiple,
    update,
    remove,
    commission,
    ensureLink,
    backfill,
    updateRole,
  ].some((mutation) => mutation.isPending);
  return {
    create,
    createMultiple,
    update,
    remove,
    commission,
    ensureLink,
    backfill,
    updateRole,
    isPending,
  };
}
