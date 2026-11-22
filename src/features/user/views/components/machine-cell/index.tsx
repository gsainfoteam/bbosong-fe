import { cn } from '@/common/utils';
import { type MachineView } from '@/features/user/viewmodels';

import { MachineVessel } from '../machine-vessel';
import { useMachineText } from './use-machine-text';

export { useMachineText } from './use-machine-text';

const IDLE_TEXT = { washer: 'text-sky-ink', dryer: 'text-orange-ink' } as const;

export function MachineCell({
  machine,
  size = 66,
  className,
  ...props
}: MachineCell.Props & Omit<React.ComponentProps<'div'>, 'children'>) {
  const text = useMachineText();
  const strong = machine.state === 'running' || machine.state === 'idle';

  return (
    <div
      role="img"
      aria-label={text.aria(machine)}
      className={cn('flex flex-col items-center', className)}
      {...props}
    >
      <MachineVessel
        type={machine.type}
        id={machine.id}
        state={machine.state}
        level={machine.level}
        mine={machine.mine}
        size={size}
      />
      <span
        className={cn(
          'mt-[7px] text-[13px] leading-none tracking-[-0.01em] whitespace-nowrap',
          strong ? 'font-bold' : 'text-ink-2 font-medium',
          machine.state === 'idle' && IDLE_TEXT[machine.type],
        )}
      >
        {text.label(machine)}
      </span>
    </div>
  );
}

export namespace MachineCell {
  export type Props = {
    machine: MachineView;
    size?: number;
    className?: string;
  };
}
