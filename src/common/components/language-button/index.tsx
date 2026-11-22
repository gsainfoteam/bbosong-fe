import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { SUPPORTED_LANGUAGES, type Language } from '@/common/lib/languages';
import { useLanguage } from '@/common/viewmodels';

import { LANGUAGE_NAME } from '../language-toggle';
import { Button } from '../ui';

export function LanguageButton({ className }: LanguageButton.Props) {
  const { t } = useTranslation('common');
  const { currentLanguage, toggleLanguage } = useLanguage();
  const current: Language = SUPPORTED_LANGUAGES.includes(currentLanguage) ? currentLanguage : 'ko';
  const next =
    SUPPORTED_LANGUAGES[(SUPPORTED_LANGUAGES.indexOf(current) + 1) % SUPPORTED_LANGUAGES.length];

  return (
    <Button
      type="button"
      variant="secondary"
      size="s"
      onClick={toggleLanguage}
      aria-label={t('switchLanguage', { language: LANGUAGE_NAME[current] })}
      className={className}
    >
      <Globe size={16} aria-hidden />
      {LANGUAGE_NAME[next]}
    </Button>
  );
}

export namespace LanguageButton {
  export type Props = {
    className?: string;
  };
}
