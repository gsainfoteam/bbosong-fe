import { useTranslation } from 'react-i18next';

import { ToggleBoolean } from '@/common/components/ui/toggle-boolean';
import { cn } from '@/common/utils';

export function RoomStatusBox({building, machine, count, toggleState, onChange, className, ...props}: RoomStatusBox.Props) {
  const { t } = useTranslation();

  // t('location.a')
  // t('location.b')
  // t('machine.washer')
  // t('machine.dryer')
  // t('user.mypage.count')

  return (
    <div className={cn('flex flex-row justify-between rounded-xl border p-3', className)} {...props}>
      <div className="flex flex-row items-end gap-1">
        <div className="flex flex-col">
          <span className="text-sm">{t(`location.${building}`)}</span>
          <span className="text-lg font-bold">{t(`machine.${machine}`)}</span>
        </div>
        <span className='text-3xl font-bold text-primary'>{count}</span>
        <span className="text-lg font-bold">{t('user.mypage.count')}</span>
      </div>
      <div>
        <ToggleBoolean size="sm" state={toggleState} onChange={onChange} />
      </div>
    </div>
  );
}

export namespace RoomStatusBox {
  export type Props = {
    building: 'a' | 'b';
    machine: 'washer' | 'dryer';
    count: number;
    toggleState: boolean;
    onChange?: () => void;
    className?: string;
  }
}