import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';
import { useLanguage } from '@/common/viewmodels';

import { Button } from '../ui';

export function LanguageToggle() {
  const { toggleLanguage, currentLanguage } = useLanguage();
  const { t } = useTranslation('common');

  const isKorean = currentLanguage === 'ko';

  return (
    <div className="flex items-center justify-center gap-1.5 rounded-lg">
      <Button
        variant="text"
        size="s"
        onClick={toggleLanguage}
        disabled={isKorean}
        aria-pressed={isKorean}
        className={cn(
          'text-body-lg disabled:text-ink uppercase',
          isKorean ? 'text-ink font-bold' : 'text-ink2',
        )}
        aria-label={isKorean ? undefined : t('switchToKorean')}
      >
        KOR
      </Button>
      <div className="bg-ink h-4 w-0.5" />
      <Button
        variant="text"
        size="s"
        onClick={toggleLanguage}
        disabled={!isKorean}
        aria-pressed={!isKorean}
        className={cn(
          'text-body-lg disabled:text-ink uppercase',
          !isKorean ? 'text-ink font-bold' : 'text-ink2',
        )}
        aria-label={isKorean ? t('switchToEnglish') : undefined}
      >
        ENG
      </Button>
    </div>
  );
}
