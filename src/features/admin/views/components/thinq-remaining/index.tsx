import { useTranslation } from 'react-i18next';

/** ThinQ 남은 시간 문구. 1시간 이상이면 시간·분, 미만이면 분만 표시한다 */
export function ThinqRemaining({ remaining }: ThinqRemaining.Props) {
  const { t } = useTranslation('admin');

  if (remaining === null) return t('thinqRemainingUnknown');

  const minutes = String(remaining.minutes);
  if (remaining.hours > 0) {
    return t('thinqRemainingHourMinute', { hours: String(remaining.hours), minutes });
  }
  return t('thinqRemainingMinutes', { minutes });
}

export namespace ThinqRemaining {
  export type Props = {
    remaining: { hours: number; minutes: number } | null;
  };
}
