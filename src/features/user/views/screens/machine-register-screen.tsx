import { useTranslation } from 'react-i18next';

import { Button, TopBar } from '@/common/components';
import { cn } from '@/common/utils';
import { MachineVessel, useMachineText } from '@/features/user';
import { type MachineView } from '@/features/user/viewmodels';

function Value({ text }: { text: string }) {
  return (
    <b className="text-ink font-bold">
      {text.split(/(\d+)/).map((part, i) =>
        /^\d+$/.test(part) ? (
          <span key={i} className="font-num text-[15px]">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </b>
  );
}

function StatusLine({ machine }: { machine: MachineView }) {
  const { t } = useTranslation('machine');
  const text = useMachineText();

  switch (machine.state) {
    case 'running':
    case 'paused': {
      const time = text.duration(machine.remainingMinutes ?? 0);
      const [before, after] = t('aria.remaining', { time }).split(time);
      return (
        <>
          {machine.state === 'paused' ? t('paused') : text.phase(machine)} · {before}
          <Value text={time} />
          {after}
        </>
      );
    }
    case 'elapsed':
      return machine.elapsedMinutes === undefined ? (
        text.phase(machine)
      ) : (
        <>
          {text.phase(machine)} · <Value text={text.elapsed(machine.elapsedMinutes)} />
        </>
      );
    default:
      return text.label(machine);
  }
}

export function MachineRegisterScreen({
  machine,
  roomTitle,
  onRegister,
  onBack,
  isPending = false,
  className,
}: MachineRegisterScreen.Props) {
  const { t } = useTranslation(['machineRegister', 'machine', 'common']);

  return (
    <div className={cn('bg-surface flex min-h-dvh flex-1 flex-col', className)}>
      <TopBar onBack={onBack} />
      <div className="flex flex-col items-center px-6 pt-[94px] text-center">
        <MachineVessel
          type={machine.type}
          id={machine.id}
          state={machine.state}
          level={machine.state === 'loading' ? 0 : machine.level}
          size={132}
        />
        <p className="text-ink-2 mt-3.5 h-[22px] text-[14px] leading-[22px] font-semibold tracking-[-0.01em]">
          {machine.state === 'loading' ? (
            <span className="bg-skeleton inline-block h-3.5 w-28 rounded-md align-middle motion-safe:animate-pulse" />
          ) : (
            <StatusLine machine={machine} />
          )}
        </p>
        <h1 className="mt-7 text-[23px] leading-[1.38] font-extrabold tracking-[-0.03em] text-balance whitespace-pre-line">
          <span className="text-ink-2 block text-[15px] font-semibold tracking-[-0.01em]">
            {roomTitle}
          </span>
          {t('confirm.title', {
            id: String(machine.id),
            type: machine.type === 'washer' ? t('machine:washer') : t('machine:dryer'),
          })}
        </h1>
      </div>
      <div className="pb-cta mt-auto grid grid-cols-[1fr_1.5fr] gap-2 px-5 pt-6">
        <Button type="button" variant="secondary" size="l" disabled={isPending} onClick={onBack}>
          {t('common:goBack')}
        </Button>
        <Button
          type="button"
          size="l"
          onClick={onRegister}
          disabled={isPending}
          aria-busy={isPending}
        >
          {isPending ? t('registering') : t('confirm.register')}
        </Button>
      </div>
    </div>
  );
}

export namespace MachineRegisterScreen {
  export type Machine =
    | MachineView
    | (Pick<MachineView, 'uuid' | 'type' | 'location' | 'gender' | 'id'> & { state: 'loading' });

  export type Props = {
    machine: Machine;
    roomTitle: string;
    onRegister: () => void;
    onBack: () => void;
    isPending?: boolean;
    className?: string;
  };
}
