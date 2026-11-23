import { useTranslation } from 'react-i18next';

import { BrandMark } from '@/common/components';
import { cn } from '@/common/utils';
import { GenderSelect } from '@/features/auth';

export function GenderScreen({ onSelect, isError, className }: GenderScreen.Props) {
  const { t } = useTranslation('auth');

  return (
    <div className={cn('bg-surface pt-safe flex min-h-dvh flex-1 flex-col', className)}>
      <div className="h-12" />
      <div className="px-6">
        <BrandMark size={44} className="mt-3" />
        <h1 className="mt-5 text-[26px] leading-[1.3] font-extrabold tracking-[-0.03em] text-balance">
          {t('gender.title')}
        </h1>
        <p className="text-ink-2 mt-2 text-[14.5px] leading-[1.6]">{t('gender.description')}</p>
        <GenderSelect onSelect={onSelect} isError={isError} className="mt-9" />
      </div>
    </div>
  );
}

export namespace GenderScreen {
  export type Props = GenderSelect.Props;
}
