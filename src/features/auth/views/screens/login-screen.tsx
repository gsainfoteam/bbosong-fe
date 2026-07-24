import { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';

import { GenderButton } from '../';

export function LoginScreen({ onLogin, className }: LoginScreen.Props) {
  const { t } = useTranslation();

  const [selected, setSelected] = useState<'male' | 'female' | null>();

  const changeGender = (gender: 'male' | 'female') => {
    setSelected(gender);
  };

  return (
    <div className={cn('mx-auto flex h-dvh w-full max-w-100 flex-col items-center', className)}>
      <div className="h-1/2 content-center">
        <span className="text-bg mb-10 text-4xl font-bold">{t('auth.title')}</span>
      </div>
      <div className="h-1/2 w-full px-15 text-center">
        <div className="mb-10 flex w-full flex-row items-center gap-1">
          <GenderButton
            key="auth-gender-male"
            selected={selected === 'male'}
            onClick={() => changeGender('male')}
          >
            {t('auth.male')}
          </GenderButton>
          <GenderButton
            key="auth-gender-female"
            selected={selected === 'female'}
            onClick={() => changeGender('female')}
          >
            {t('auth.female')}
          </GenderButton>
        </div>
        <button
          className="bg-bg rounded-sm px-8 py-2 text-base font-semibold text-white"
          onClick={onLogin}
        >
          {t('auth.start')}
        </button>
      </div>
    </div>
  );
}

export namespace LoginScreen {
  export type Props = {
    onLogin?: () => void;
    className?: string;
  };
}
