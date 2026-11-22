import { useNavigate } from '@tanstack/react-router';

import { useTranslation } from 'react-i18next';

import machineRegister from '@/assets/machine-register.svg';
import { Button } from '@/common/components/ui/button';
import { MachineRegisterMessage } from '@/features/user';

export function MachineRegisterScreen({
  machine,
  location,
  onRegister,
  isPending = false,
}: MachineRegisterScreen.Props) {
  const { i18n, t } = useTranslation(['common', 'machineRegister']);
  const navigate = useNavigate();

  return (
    <div className="h-dvh">
      <div className="h-1/2 content-center p-10">
        <div className="bg-soft flex aspect-square w-full flex-col justify-end p-5">
          <img src={machineRegister} alt="machineRegister" />
        </div>
      </div>
      <div className="flex h-1/2 w-full flex-col items-center justify-between px-10 py-15">
        <MachineRegisterMessage lang={i18n.language} machine={machine} location={location} />
        <div className="flex w-full flex-row items-center justify-between gap-2 p-5">
          <Button
            variant="secondary"
            disabled={isPending}
            onClick={() => navigate({ to: '/' })}
            className="flex-1"
          >
            {t('goBack')}
          </Button>
          <Button onClick={onRegister} loading={isPending} className="flex-1">
            {isPending ? t('machineRegister:registering') : t('yes')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export namespace MachineRegisterScreen {
  export type Props = {
    machine: { type: 'washer' | 'dryer'; id: number };
    location: 'a' | 'b';
    onRegister: () => void;
    isPending?: boolean;
  };
}
