import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';
import { useLanguage } from '@/common/viewmodels';

import { Button, ToggleSelect } from '../ui';

const LANGUAGE_NAMES = { ko: '한국어', en: 'English' } as const;

export function LanguageToggle({ variant = 'inline' }: LanguageToggle.Props) {
  const { toggleLanguage, currentLanguage } = useLanguage();
  const { t } = useTranslation('common');

  const isKorean = currentLanguage === 'ko';

  // 언어 이름은 번역하지 않고 각 언어로 적는다
  if (variant === 'segment') {
    return (
      <ToggleSelect
        label={t('language')}
        stateList={[LANGUAGE_NAMES.ko, LANGUAGE_NAMES.en]}
        state={isKorean ? LANGUAGE_NAMES.ko : LANGUAGE_NAMES.en}
        onChange={(name) => {
          if ((name === LANGUAGE_NAMES.ko) !== isKorean) toggleLanguage();
        }}
        className="max-w-none"
      />
    );
  }

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

export namespace LanguageToggle {
  export type Props = {
    /** inline은 KOR | ENG 글자, segment는 두 칸짜리 세그먼트 */
    variant?: 'inline' | 'segment';
  };
}
