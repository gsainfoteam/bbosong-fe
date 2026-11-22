import { useEffect, useRef, useState } from 'react';

import { useNavigate, useParams } from '@tanstack/react-router';

import { useTranslation } from 'react-i18next';

import { Sheet } from '@/common/components';
import { PushPermissionCard, usePushPermission } from '@/features/push-notification';
import { MachineBox, MachineCompletionDialog, MachineRegisterScreen } from '@/features/user';
import { useFindMachineByUuid, useRegisterMachine } from '@/features/user/viewmodels';

export function MachineRegisterFrame() {
  const navigate = useNavigate();
  const { t } = useTranslation('notification');
  const { status } = usePushPermission();
  const [showPermission, setShowPermission] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
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
    if (showPermission) dialogRef.current?.showModal();
  }, [showPermission]);

  useEffect(() => {
    if (showPermission && status === 'granted') {
      dialogRef.current?.close();
      void navigate({ to: '/' });
    }
  }, [navigate, showPermission, status]);

  const closePermission = () => {
    dialogRef.current?.close();
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
      <Sheet
        ref={dialogRef}
        aria-label={t('permission.completionTitle')}
        onCancel={closePermission}
      >
        <PushPermissionCard
          presentation="sheet"
          onLater={closePermission}
          art={
            // 방금 등록한 기기를 내 빨래 표식과 함께 보여 준다
            <MachineBox
              machine={{
                ...machineData,
                status: 'using',
                mine: true,
                elapsedMinutes: 20,
                remainingDisplay: { kind: 'minutes', minutes: 80 },
              }}
              showCaption={false}
              className="w-18"
            />
          }
        />
      </Sheet>
    </>
  );
}
