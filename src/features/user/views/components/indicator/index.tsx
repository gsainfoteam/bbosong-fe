import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';

export function Indicator({className}: {className?: string;}) {
  const { t } = useTranslation();

  return (
    <div className={cn('flex flex-row gap-2 text-sm', className)}>
      <span>&#x25A0;: {t('machine.washer')}</span>
      <span>&#x25CF;: {t('machine.dryer')}</span>
    </div>
  );
}
