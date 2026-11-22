import { useTranslation } from 'react-i18next';

import { formatRemainingMinutes } from '@/common/utils';

import type { MachineBox } from '.';

export type Display =
  | { kind: 'idle' }
  | { kind: 'disabled' }
  | { kind: 'loading' }
  | { kind: 'remaining'; minutes: number }
  | { kind: 'detecting' }
  | { kind: 'elapsed'; minutes: number }
  | { kind: 'using' };

export function toDisplay(machine: MachineBox.Props['machine']): Display {
  if (machine.status === 'loading') return { kind: 'loading' };
  if (machine.status === 'disabled') return { kind: 'disabled' };
  if (machine.status === 'idle') return { kind: 'idle' };

  if (machine.remainingDisplay?.kind === 'detecting') return { kind: 'detecting' };
  if (machine.remainingDisplay?.kind === 'minutes') {
    return { kind: 'remaining', minutes: machine.remainingDisplay.minutes };
  }
  if (machine.elapsedMinutes !== undefined && machine.elapsedMinutes >= 0) {
    return { kind: 'elapsed', minutes: machine.elapsedMinutes };
  }

  return { kind: 'using' };
}

export function useLabels(display: Display) {
  const { t } = useTranslation('machine');

  const short = (minutes: number) => {
    const { hours, minutes: rest } = formatRemainingMinutes(minutes);
    return hours > 0
      ? t('captionHourMinute', { hours: String(hours), minutes: String(rest) })
      : t('captionMinute', { minutes: String(rest) });
  };

  switch (display.kind) {
    case 'idle':
      return { caption: t('idle'), spoken: t('idle') };
    case 'disabled':
      return { caption: t('disabled'), spoken: t('disabled') };
    case 'loading':
      return { caption: '', spoken: '' };
    case 'detecting':
      return { caption: t('remainingDetecting'), spoken: t('remainingDetecting') };
    case 'remaining': {
      const { hours, minutes } = formatRemainingMinutes(display.minutes);
      return {
        caption: short(display.minutes),
        spoken:
          hours > 0
            ? t('remainingHourMinute', { hours: String(hours), minutes: String(minutes) })
            : t('remainingMinute', { minutes: String(minutes) }),
      };
    }
    case 'elapsed': {
      const hours = Math.floor(display.minutes / 60);
      const minutes = display.minutes % 60;
      const text =
        hours > 0
          ? t('elapsedHourMinute', { hours: String(hours), minutes: String(minutes) })
          : t('elapsedMinute', { minutes: String(minutes) });
      return { caption: text, spoken: text };
    }
    case 'using':
      return { caption: t('using'), spoken: t('using') };
  }
}
