import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';
import { Bell, BellOff, Plus } from 'lucide-react';

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
  className,
  ...props
}: UsingMachineBox.Props) {
  const { t } = useTranslation(['mypage', 'machine', 'location']);

  // t('machine:washer')
  // t('machine:dryer')
  // t('location:a')
  // t('location:b')
  // t('location:laundryRoom')

  return (
    <div
      className={cn(
        className,
        'text-text-primary border-border px-2 flex min-h-20 flex-col items-center justify-center rounded-lg border gap-0.5',
      )}
      {...props}
    >
      <p>
        {t(`location:${location}`)} {t('machine:count', { id: String(machine.id) })}
      </p>
      <p className='mb-0.5'>{t(MACHINE_KEYS[machine.type])}</p>
      {notification ? <Bell className="text-primary" /> : <BellOff />}
    </div>
  );
}

export function AddUsingMachineBox() {
  return (
    <div className="border-border flex min-h-20 items-center justify-center rounded-lg border">
      <Plus />
    </div>
  );
}

export namespace UsingMachineBox {
  export type Props = {
    machine: { type: 'washer' | 'dryer'; id: number };
    location: 'a' | 'b';
    notification: boolean;
    onClear: () => void;
    className?: string;
  };
}
