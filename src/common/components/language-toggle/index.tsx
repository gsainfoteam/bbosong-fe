import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';
import { useLanguage } from '@/common/viewmodels';

export function LanguageToggle() {
  const { toggleLanguage, currentLanguage } = useLanguage();
  const { t } = useTranslation('common');

  const isKorean = currentLanguage === 'ko';

  return (
    <div className="flex items-center justify-center gap-1.5 rounded-lg">
      <button
        type="button"
        onClick={() => {
          if (!isKorean) toggleLanguage();
        }}
        className={cn(
          'text-body-lg uppercase transition-colors',
          isKorean ? 'text-primary font-bold' : 'text-text-secondary',
        )}
        aria-label={t('switchToKorean')}
      >
        KOR
      </button>
      <div className="bg-primary h-4 w-0.5" />
      <button
        type="button"
        onClick={() => {
          if (isKorean) toggleLanguage();
        }}
        className={cn(
          'text-body-lg uppercase transition-colors',
          !isKorean ? 'text-primary font-bold' : 'text-text-secondary',
        )}
        aria-label={t('switchToEnglish')}
      >
        ENG
      </button>
    </div>
  );
}
