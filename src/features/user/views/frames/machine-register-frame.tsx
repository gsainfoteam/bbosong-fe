import { useEffect, useState } from 'react';

import { useNavigate, useParams } from '@tanstack/react-router';

import { useTranslation } from 'react-i18next';

import { BottomSheet, Button } from '@/common/components';
import { PushPermissionCard, usePushPermission } from '@/features/push-notification';
import { MachineCompletionDialog, MachineRegisterScreen } from '@/features/user';
import {
  toMachineIdentity,
  useFindMachineByUuid,
  useMachineViews,
  useRegisterMachine,
} from '@/features/user/viewmodels';

import { useRoomNames } from './use-room-selection';

export function MachineRegisterFrame() {
  const navigate = useNavigate();
  const { t } = useTranslation(['notification', 'main']);
  const roomNames = useRoomNames();
  const { status } = usePushPermission();
  const [showPermission, setShowPermission] = useState(false);
  const { machineUuid } = useParams({
    from: '/_auth-required/_user/machine-register/$machineUuid',
  });

  const { machine, isNotFound } = useFindMachineByUuid(machineUuid);
  const { views } = useMachineViews();
  const {
    mutate: registerMachine,
    isPending,
    confirmation,
    confirmCompletion,
    cancelConfirmation,
  } = useRegisterMachine(() => {
    if (status === 'granted') {
      void navigate({ to: '/' });
    } else {
      setShowPermission(true);
    }
  });

  useEffect(() => {
    if (showPermission && status === 'granted') {
      void navigate({ to: '/' });
    }
  }, [navigate, showPermission, status]);

  const goHome = () => {
    void navigate({ to: '/' });
  };

  if (isNotFound || !machine) return null;

  const identity = toMachineIdentity(machine);
  const view: MachineRegisterScreen.Machine = views.find((item) => item.uuid === machineUuid) ?? {
    ...identity,
    state: 'loading',
  };

  const register = () => {
    registerMachine({ params: { path: { uuid: machineUuid } } });
  };

  return (
    <>
      <MachineRegisterScreen
        machine={view}
        roomTitle={t('main:roomTitle', roomNames(identity.location, identity.gender))}
        onRegister={register}
        onBack={goHome}
        isPending={isPending}
      />
      {confirmation && (
        <MachineCompletionDialog
          isPending={isPending}
          onConfirm={confirmCompletion}
          onClose={cancelConfirmation}
        />
      )}
      <BottomSheet
        open={showPermission}
        onClose={goHome}
        aria-label={t('notification:permission.completionTitle')}
      >
        <PushPermissionCard presentation="sheet" />
        <Button
          type="button"
          onClick={goHome}
          className="text-ink-2 mt-3 w-full border-0 py-3 text-sm"
        >
          {t('notification:permission.later')}
        </Button>
      </BottomSheet>
    </>
  );
}
