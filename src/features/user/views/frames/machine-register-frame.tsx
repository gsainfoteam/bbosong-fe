import { useEffect, useState } from 'react';

import { useNavigate, useParams } from '@tanstack/react-router';

import { useTranslation } from 'react-i18next';

import { PushPermissionSheet, usePermissionPrompt } from '@/features/push-notification';
import { MachineCompletionDialog, MachineRegisterScreen, MachineVessel } from '@/features/user';
import {
  toMachineIdentity,
  useFindMachineByUuid,
  useMachineViews,
  useRegisterMachine,
} from '@/features/user/viewmodels';

import { useRoomNames } from './use-room-selection';

export function MachineRegisterFrame() {
  const navigate = useNavigate();
  const { t } = useTranslation('main');
  const roomNames = useRoomNames();
  const prompt = usePermissionPrompt();
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
    if (prompt.status === 'granted') {
      void navigate({ to: '/' });
    } else {
      setShowPermission(true);
    }
  });

  useEffect(() => {
    if (showPermission && prompt.status === 'granted') {
      void navigate({ to: '/' });
    }
  }, [navigate, showPermission, prompt.status]);

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
        roomTitle={t('roomTitle', roomNames(identity.location, identity.gender))}
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
      <PushPermissionSheet
        open={showPermission}
        onClose={goHome}
        prompt={prompt}
        art={
          <MachineVessel
            type={view.type}
            id={view.id}
            state={view.state}
            level={view.state === 'loading' ? 0 : view.level}
            mine
            size={72}
          />
        }
      />
    </>
  );
}
