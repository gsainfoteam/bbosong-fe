import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';

const MACHINE_KEYS = {
  washer: 'machine.washer',
  dryer: 'machine.dryer',
} as const;

const LOCATION_KEYS = {
  a: 'location.a',
  b: 'location.b',
} as const;

export function UsingMachineBox({ machine, location, onClear, className, ...props }: UsingMachineBox.Props) {
  const { t } = useTranslation();

  // t('machine.washer')
  // t('machine.dryer')
  // t('location.a')
  // t('location.b')
  // t('location.laundryRoom')

  return (
    <div className={cn('flex flex-row justify-between items-center p-3 rounded-lg bg-white', className)} {...props}>
      <div className='text-bg'>
        <h2>
          {t(MACHINE_KEYS[machine.type])} {machine.id}
        </h2>
        <span className='text-sm'>{`${t(LOCATION_KEYS[location])} ${t('location.laundryRoom')}`}</span>
      </div>
      <button type='button' className='px-2 py-1 rounded-xl bg-bg text-white text-xs' onClick={onClear}>{t('user.mypage.clear')}</button>
    </div>
  );
}

export namespace UsingMachineBox {
  export type Props = {
    machine: { type: 'washer' | 'dryer'; id: number };
    location: 'a' | 'b';
    onClear: () => void;
    className?: string;
  };
}