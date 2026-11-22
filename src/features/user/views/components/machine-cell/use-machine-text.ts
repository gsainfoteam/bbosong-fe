import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { formatRemainingMinutes } from '@/common/utils';
import { type MachineView } from '@/features/user/viewmodels';

export function useMachineText() {
  const { t } = useTranslation('machine');

  const duration = (total: number) => {
    const { hours, minutes } = formatRemainingMinutes(total);
    return hours > 0
      ? t('hourMinute', { hours: String(hours), minutes: String(minutes) })
      : t('minute', { minutes: String(minutes) });
  };

  const elapsed = (total: number) => {
    const { hours, minutes } = formatRemainingMinutes(total);
    return hours > 0
      ? t('elapsedHourMinute', { hours: String(hours), minutes: String(minutes) })
      : t('elapsedMinute', { minutes: String(minutes) });
  };

  const name = (machine: Pick<MachineView, 'type' | 'id'>) =>
    `${machine.type === 'washer' ? t('washer') : t('dryer')} ${t('count', { id: String(machine.id) })}`;

  const phase = (machine: Pick<MachineView, 'phase'>) =>
    ({
      washing: t('phase.washing'),
      drying: t('phase.drying'),
      cooling: t('phase.cooling'),
    })[machine.phase];

  const endsAt = (time: number) => t('endsAt', { time: dayjs(time).format('HH:mm') });

  /** 칸 아래 한 줄. 돌고 있으면 남은 시간, 아니면 상태 한 단어 */
  const label = (machine: MachineView) => {
    switch (machine.state) {
      case 'running':
        return duration(machine.remainingMinutes ?? 0);
      case 'elapsed':
        return machine.elapsedMinutes === undefined
          ? t('detecting')
          : elapsed(machine.elapsedMinutes);
      case 'idle':
        return t('idle');
      case 'detecting':
        return t('detecting');
      case 'paused':
        return t('paused');
      case 'off':
        return t('off');
    }
  };

  const status = (machine: MachineView) => {
    switch (machine.state) {
      case 'running':
        return `${phase(machine)}, ${t('aria.remaining', { time: duration(machine.remainingMinutes ?? 0) })}`;
      case 'elapsed':
        return machine.elapsedMinutes === undefined
          ? phase(machine)
          : t('aria.elapsed', { time: duration(machine.elapsedMinutes) });
      case 'detecting':
        return t('aria.detecting');
      default:
        return label(machine);
    }
  };

  /** 스크린리더가 칸 하나를 한 문장으로 읽게 한다 */
  const aria = (machine: MachineView) =>
    [name(machine), machine.mine && t('aria.mine'), status(machine)].filter(Boolean).join(', ');

  return { duration, elapsed, name, phase, endsAt, label, aria };
}
