import { useTranslation } from 'react-i18next';

import { SUPPORTED_LANGUAGES, type Language } from '@/common/lib/languages';
import { useLanguage } from '@/common/viewmodels';

import { ToggleSelect } from '../ui';

// 언어 이름은 그 언어로 적어야 지금 언어를 못 읽는 사람도 찾을 수 있다.
export const LANGUAGE_NAME: Record<Language, string> = {
  ko: '한국어',
  en: 'English',
};

export function LanguageToggle({ size, className }: LanguageToggle.Props) {
  const { currentLanguage, changeLanguage } = useLanguage();
  const { t } = useTranslation('mypage');

  return (
    <ToggleSelect
      aria-label={t('language')}
      stateList={[...SUPPORTED_LANGUAGES]}
      state={SUPPORTED_LANGUAGES.includes(currentLanguage) ? currentLanguage : 'ko'}
      onChange={(lng) => void changeLanguage(lng as Language)}
      getLabel={(lng) => LANGUAGE_NAME[lng as Language]}
      size={size}
      className={className}
    />
  );
}

export namespace LanguageToggle {
  export type Props = {
    size?: ToggleSelect.Props['size'];
    className?: string;
  };
}
