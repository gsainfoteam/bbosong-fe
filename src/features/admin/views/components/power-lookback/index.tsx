import { useTranslation } from 'react-i18next';

import { secondaryButtonClass } from '../../styles';

const LOOKBACK_MINUTES = [60, 30, 10] as const;

export function PowerLookbackButtons({ disabled, onLookback }: PowerLookbackButtons.Props) {
  const { t } = useTranslation('admin');
  const label = {
    60: t('lookbackHour'),
    30: t('lookbackHalfHour'),
    10: t('lookbackTenMinutes'),
  } as const;
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t('lookback')}>
      <span className="text-text-secondary text-sm dark:text-slate-400">{t('lookback')}</span>
      {LOOKBACK_MINUTES.map((minutes) => (
        <button
          key={minutes}
          type="button"
          className={secondaryButtonClass}
          disabled={disabled}
          onClick={() => onLookback(minutes)}
        >
          {label[minutes]}
        </button>
      ))}
    </div>
  );
}

export namespace PowerLookbackButtons {
  export type Props = {
    disabled?: boolean;
    onLookback: (minutes: 60 | 30 | 10) => void;
  };
}
