import { useState } from 'react';

import { Bell, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Modal } from '@/common/components';
import { cn } from '@/common/utils';

const MACHINE_KEYS = {
  washer: 'machine:washer',
  dryer: 'machine:dryer',
} as const;

// const LOCATION_KEYS = {
//   a: 'location:a',
//   b: 'location:b',
// } as const;

export function UsingMachineBox({
  machine,
  location,
  notification,
  onClear,
  onUnregister,
  isUnregistering = false,
  className,
  ...props
}: UsingMachineBox.Props) {
  const { t } = useTranslation(['mypage', 'machine', 'location', 'machineRegister']);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // t('machine:washer')
  // t('machine:dryer')
  // t('location:a')
  // t('location:b')
  // t('location:laundryRoom')

  return (
    <div
      className={cn(
        className,
        'text-text-primary border-border flex min-h-20 min-w-20 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border px-2',
      )}
      {...props}
    >
      <p>
        {t(`location:${location}`)} {t('machine:count', { id: String(machine.id) })}
      </p>
      <p className="mb-0.5">{t(MACHINE_KEYS[machine.type])}</p>
      <button
        type="button"
        aria-label={t('machineRegister:unregister.confirmation.title')}
        onClick={() => setIsConfirmOpen(true)}
      >
        <Bell className={cn(notification && 'text-primary')} aria-hidden />
      </button>
      {isConfirmOpen && (
        <Modal
          title={t('machineRegister:unregister.confirmation.title')}
          description={t('machineRegister:unregister.confirmation.description')}
          confirmText={
            isUnregistering
              ? t('machineRegister:unregister.confirmation.pending')
              : t('machineRegister:unregister.confirmation.confirm')
          }
          isPending={isUnregistering}
          onConfirm={onUnregister}
          onClose={() => setIsConfirmOpen(false)}
        />
      )}
    </div>
  );
}

export function AddUsingMachineBox({ onAdd }: AddUsingMachineBox.Props) {
  const { t } = useTranslation('mypage');

  return (
    <button
      type="button"
      aria-label={t('addMachine')}
      className="flex min-h-20 w-20 shrink-0 items-center justify-center"
      onClick={onAdd}
    >
      <Plus size={32} strokeWidth={1.5} aria-hidden />
    </button>
  );
}

export namespace UsingMachineBox {
  export type Props = {
    machine: { type: 'washer' | 'dryer'; id: number };
    location: 'a' | 'b';
    notification: boolean;
    onClear: () => void;
    /** 확인 모달에서 확인을 누르면 호출된다. 성공 시 목록에서 빠지며 모달도 함께 사라진다. */
    onUnregister: () => void;
    isUnregistering?: boolean;
    className?: string;
  };
}

export namespace AddUsingMachineBox {
  export type Props = {
    onAdd: () => void;
  };
}
