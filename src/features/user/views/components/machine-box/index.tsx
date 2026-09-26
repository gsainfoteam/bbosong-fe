import { useTranslation } from 'react-i18next';
import { cn } from '@/common/utils';

const STATUS_BORDER: Record<MachineBox.Status, string> = {
  idle: 'border-available',
  using: 'border-unavailable',
  disabled: 'border-disabled',
};

export function MachineBox({ machine, className, ...props }: MachineBox.Props) {
  const { t } = useTranslation('machine');

  // t('idle')
  // t('using')
  // t('disabled')

  return (
    <div
      className={cn(
        className,
        'flex aspect-square flex-col items-center justify-center gap-0 p-1 text-center break-keep border-4',
        machine.type === 'washer' ? 'rounded-full ' : 'rounded-lg',
        STATUS_BORDER[machine.status],
      )}
      {...props}
    >
      <p>{t(machine.type)} {machine.id}</p>
      <span className='text-xs'>{t(machine.status)}</span>
    </div>
  );
}

export namespace MachineBox {
  export type Status = 'idle' | 'using' | 'disabled';

  export type Props = {
    machine: { type: 'washer' | 'dryer'; id: number; status: Status };
    className?: string;
  };
}
