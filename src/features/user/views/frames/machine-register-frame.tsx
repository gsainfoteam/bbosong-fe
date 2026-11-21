import { useEffect, useState } from 'react';

import { useNavigate, useParams } from '@tanstack/react-router';

import { useTranslation } from 'react-i18next';

import { BottomSheet, Button } from '@/common/components';
import { PushPermissionCard, usePushPermission } from '@/features/push-notification';
import { MachineCompletionDialog, MachineRegisterScreen } from '@/features/user';
import { useFindMachineByUuid, useRegisterMachine } from '@/features/user/viewmodels';

export function MachineRegisterFrame() {
  const navigate = useNavigate();
  const { t } = useTranslation('notification');
  const { status } = usePushPermission();
  const [showPermission, setShowPermission] = useState(false);
  const { machineUuid } = useParams({
    from: '/_auth-required/_user/machine-register/$machineUuid',
  });

  const { machine, isNotFound } = useFindMachineByUuid(machineUuid);
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

  const closePermission = () => {
    void navigate({ to: '/' });
  };

  if (isNotFound || !machine) return null;

  const machineData = {
    type: machine.type.toLowerCase() as 'washer' | 'dryer',
    id: machine.index,
  };

  const location = machine.location.toLowerCase() as 'a' | 'b';

  const register = () => {
    registerMachine({ params: { path: { uuid: machineUuid } } });
  };

  return (
    <>
      <MachineRegisterScreen
        machine={machineData}
        location={location}
        onRegister={register}
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
        onClose={closePermission}
        aria-label={t('permission.completionTitle')}
      >
        <PushPermissionCard presentation="sheet" />
        <Button
          type="button"
          onClick={closePermission}
          className="text-text-secondary mt-3 w-full border-0 py-3 text-sm"
        >
          {t('permission.later')}
        </Button>
      </BottomSheet>
    </>
  );
}
