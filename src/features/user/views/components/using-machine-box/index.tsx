import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';
import { Plus } from 'lucide-react';

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
    // <div
    //   className={cn(
    //     'bg-bg-surface flex flex-row items-center justify-between rounded-lg p-3',
    //     className,
    //   )}
    //   {...props}
    // >
    //   <div className="text-text-primary">
    //     <h2>
    //       {t(MACHINE_KEYS[machine.type])} {machine.id}
    //     </h2>
    //     <span className="text-sm">{`${t(LOCATION_KEYS[location])} ${t('location:laundryRoom')}`}</span>
    //   </div>
    //   <button
    //     type="button"
    //     className="bg-bg-subtle rounded-xl px-2 py-1 text-xs text-white"
    //     onClick={onClear}
    //   >
    //     {t('clear')}
    //   </button>
    // </div>
    <div className={cn(className, "flex bg-bg-surface justify-center items-center min-h-20")} {...props}>
      <p>{t(MACHINE_KEYS[machine.type])}</p>
      <p></p>
    </div>
  );
}

export function AddUsingMachineBox() {
  return (
    <div className="flex bg-bg-surface justify-center items-center min-h-20">
      <Plus />
    </div>
  )
}

export namespace UsingMachineBox {
  export type Props = {
    machine: { type: 'washer' | 'dryer'; id: number };
    location: 'a' | 'b';
    onClear: () => void;
    className?: string;
  };
}
