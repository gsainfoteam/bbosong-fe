import { useState } from 'react';

import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';

export function IdpLoginButton({ onLogin }: IdpLoginButton.Props) {
  const { t } = useTranslation();
  const [clicked, setClicked] = useState(false);

  return (
    <button
      onClick={() => {
        setClicked(true);
        onLogin();
      }}
      disabled={clicked}
      className={cn(
        'bg-bg-surface flex h-12 w-full items-center justify-center rounded-lg text-lg text-text-primary',
      )}
    >
      {!clicked ? t('auth.login') : <Loader2 className="animate-spin text-text-primary" size={20} />}
    </button>
  );
}

export namespace IdpLoginButton {
  export type Props = {
    onLogin: () => void;
  };
}
