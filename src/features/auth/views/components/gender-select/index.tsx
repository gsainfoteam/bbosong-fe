import { useState } from 'react';

import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';
import { type Gender, GenderButton } from '@/features/auth';

export function GenderSelect({ onLogin, className, ...props }: GenderSelect.Props) {
  const { t } = useTranslation();

  const [selected, setSelected] = useState<Gender>(null);
  const [clicked, setClicked] = useState(false);

  const changeGender = (gender: Gender) => {
    setSelected(gender);
  };

  const clickLogin = () => {
    if (!selected) {
      console.log('not selected');
      return;
    }
    setClicked(true);
    onLogin(selected);
  };

  return (
    <>
      {/*<p className="text-status-fail mb-3">{t('auth.genderAlert')}</p>*/}
      <div
        className={cn('mb-10 flex w-full flex-row items-center gap-1 px-10', className)}
        {...props}
      >
        <GenderButton
          key="auth-gender-male"
          selected={selected === 'male'}
          disabled={clicked}
          onClick={() => changeGender('male')}
        >
          {t('auth.male')}
        </GenderButton>
        <GenderButton
          key="auth-gender-female"
          selected={selected === 'female'}
          disabled={clicked}
          onClick={() => changeGender('female')}
        >
          {t('auth.female')}
        </GenderButton>
      </div>
      <button
        className="bg-bg rounded-sm px-8 py-2 text-base font-semibold text-white"
        onClick={clickLogin}
        disabled={clicked}
      >
        {!clicked ? t('auth.start') : <Loader2 className="animate-spin text-white" />}
        {}
      </button>
    </>
  );
}

export namespace GenderSelect {
  export type Props = {
    onLogin: (gender: Gender) => void;
    className?: string;
  };
}
