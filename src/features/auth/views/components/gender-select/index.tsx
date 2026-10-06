import { useState } from 'react';

import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';
import { type Gender, GenderButton } from '@/features/auth';

export function GenderSelect({ onLogin, isLoginError, className, ...props }: GenderSelect.Props) {
  const { t } = useTranslation('auth');

  const [pending, setPending] = useState(false);

  // 로그인 에러가 나면 다시 고를 수 있도록 대기 표시를 끈다
  const isPending = pending && !isLoginError;

  return (
    <div className={cn('flex w-full items-center justify-center gap-3 px-3', className)} {...props}>
      {!isPending ? (
        <>
          <GenderButton
            key="auth-gender-male"
            onClick={() => {
              onLogin('male');
              setPending(true);
            }}
          >
            {t('male')}
          </GenderButton>
          <GenderButton
            key="auth-gender-female"
            onClick={() => {
              onLogin('female');
              setPending(true);
            }}
          >
            {t('female')}
          </GenderButton>
        </>
      ) : (
        <Loader2 className="text-text-primary animate-spin" />
      )}
    </div>
  );
}

export namespace GenderSelect {
  export type Props = {
    onLogin: (gender: Gender) => void;
    isLoginError?: boolean;
    className?: string;
  };
}
