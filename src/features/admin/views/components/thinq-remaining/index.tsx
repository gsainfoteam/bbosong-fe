import { useTranslation } from 'react-i18next';

/** ThinQ 남은 시간 문구. 감지 중 / 시·분 / 알 수 없음. */
export function ThinqRemaining({ remaining, isDetecting = false }: ThinqRemaining.Props) {
  const { t } = useTranslation('admin');

  if (isDetecting) return t('thinqRemainingDetecting');
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
    isDetecting?: boolean;
  };
}
