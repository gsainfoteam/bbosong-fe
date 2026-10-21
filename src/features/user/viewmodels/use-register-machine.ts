import { useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { $api } from '@/common/lib';

import { ApiPaths } from '../models';

export function useRegisterMachine(onRegistered?: () => void) {
  const { t } = useTranslation(['machineRegister', 'error']);
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const requestInFlight = useRef(false);
  const [confirmation, setConfirmation] = useState<{
    uuid: string;
    usageUuid: string;
  } | null>(null);
  const refreshMachines = () =>
    queryClient.invalidateQueries({
      predicate: ({ queryKey }) =>
        queryKey[0] === 'get' &&
        typeof queryKey[1] === 'string' &&
        queryKey[1].startsWith('/machine'),
    });
  const onSuccess = async (data: { success: boolean }) => {
    setConfirmation(null);
    if (!data.success) {
      toast.error(t('error.alreadyUsing'));
      return;
    }
    await refreshMachines();
    toast.success(t('success'));
    if (onRegistered) onRegistered();
    else void navigate({ to: '/' });
  };
  const onError = async (error: unknown) => {
    const err = error as {
      statusCode?: number;
      message?: string;
      errorCode?: string;
    };
    if (err?.errorCode === 'MACHINE_USAGE_CHANGED') {
      await refreshMachines();
      toast.error(t('error.usageChanged'));
    } else if (err?.errorCode === 'MACHINE_ALREADY_REGISTERED' || err?.statusCode === 409) {
      toast.error(t('error.alreadyUsing'));
    } else if (err?.errorCode === 'MACHINE_NOT_RUNNING') {
      await refreshMachines();
      toast.error(t('error.notRunning'));
    } else if (err?.statusCode === 404) {
      toast.error(t('error:notFound'));
    } else if (err?.statusCode === 400) {
      toast.error(t('error:badRequest'));
    } else if (err?.statusCode === 401) {
      toast.error(t('error:unauthorized'));
    } else if (err?.statusCode === 403) {
      toast.error(
        err?.message === 'Machine gender does not match user gender.'
          ? t('error:genderMismatch')
          : t('error:forbidden'),
      );
    } else if (err?.statusCode === 500) {
      toast.error(t('error:internalServerError'));
    } else {
      toast.error(t('error:generic'));
    }
  };
  const onSettled = () => {
    requestInFlight.current = false;
  };

  const registration = $api.useMutation('post', ApiPaths.MachineController_registerMachineUsage, {
    onSuccess,
    onError: (error, variables) => {
      if ('errorCode' in error && error.errorCode === 'MACHINE_COMPLETION_CONFIRMATION_REQUIRED') {
        if ('usageUuid' in error && error.usageUuid) {
          setConfirmation({ uuid: variables.params.path.uuid, usageUuid: error.usageUuid });
        } else {
          toast.error(t('error:generic'));
        }
        return;
      }
      return onError(error);
    },
    onSettled,
  });
  const completion = $api.useMutation('post', ApiPaths.MachineController_confirmMachineCompletion, {
    onSuccess,
    onError: (error) => {
      setConfirmation(null);
      return onError(error);
    },
    onSettled,
  });

  return {
    mutate: (variables: Parameters<typeof registration.mutate>[0]) => {
      if (requestInFlight.current || confirmation) return;
      requestInFlight.current = true;
      registration.mutate(variables);
    },
    isPending: registration.isPending || completion.isPending,
    confirmation,
    confirmCompletion: () => {
      if (requestInFlight.current || !confirmation) return;
      requestInFlight.current = true;
      completion.mutate({
        params: { path: { uuid: confirmation.uuid } },
        body: { usageUuid: confirmation.usageUuid },
      });
    },
    cancelConfirmation: () => {
      if (!requestInFlight.current) setConfirmation(null);
    },
  };
}
