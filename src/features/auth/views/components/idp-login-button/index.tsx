import { useState } from 'react';

import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// import { cn } from '@/common/utils';
import { Button } from '@/common/components/ui/button';

export function IdpLoginButton({ onLogin }: IdpLoginButton.Props) {
  const { t } = useTranslation();
  const [clicked, setClicked] = useState(false);

  return (
    <Button
      onClick={() => {
        setClicked(true);
        onLogin();
      }}
      disabled={clicked}
      className="flex h-12 w-full items-center justify-center"
    >
      {!clicked ? (
        t('auth.login')
      ) : (
        <Loader2 className="text-text-primary animate-spin" size={20} />
      )}
    </Button>
  );
}

export namespace IdpLoginButton {
  export type Props = {
    onLogin: () => void;
  };
}
