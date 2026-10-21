import { useEffect, useRef, useState } from 'react';

import { useNavigate, useParams } from '@tanstack/react-router';

import { useTranslation } from 'react-i18next';

import { Button } from '@/common/components';
import { PushPermissionCard, usePushPermission } from '@/features/push-notification';
import { MachineCompletionDialog, MachineRegisterScreen } from '@/features/user';
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
      <dialog
        ref={dialogRef}
        aria-label={t('permission.completionTitle')}
        className="bg-bg text-text-primary fixed inset-x-0 top-auto bottom-0 mx-auto my-0 max-h-[85dvh] w-full max-w-120 overflow-y-auto rounded-t-3xl px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] backdrop:bg-black/40"
        onCancel={closePermission}
      >
        <div aria-hidden="true" className="bg-border mx-auto mb-6 h-1 w-10 rounded-full" />
        <PushPermissionCard presentation="sheet" />
        <Button
          type="button"
          onClick={closePermission}
          className="text-text-secondary mt-3 w-full border-0 py-3 text-sm"
        >
          {t('permission.later')}
        </Button>
      </dialog>
    </>
  );
}
