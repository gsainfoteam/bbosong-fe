import { useTranslation } from 'react-i18next';

export function Indicator() {
  const { t } = useTranslation();

  return (
    <div className='flex flex-row gap-2 text-sm'>
      <span>&#x25A0;: {t('machine.washer')}</span>
      <span>&#x25CF;: {t('machine.dryer')}</span>
    </div>
  );
}