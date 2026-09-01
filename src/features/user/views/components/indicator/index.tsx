import { useTranslation } from 'react-i18next';

export function Indicator() {
  const { t } = useTranslation('machine');

  return (
    <div className="flex flex-row gap-2 text-sm">
      <span>&#x25A0;: {t('washer')}</span>
      <span>&#x25CF;: {t('dryer')}</span>
    </div>
  );
}
