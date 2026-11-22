import { useState } from 'react';

import { useTranslation } from 'react-i18next';

// import { cn } from '@/common/utils';
import { Button } from '@/common/components/ui/button';

export function IdpLoginButton({ onLogin }: IdpLoginButton.Props) {
  const { t } = useTranslation('auth');
  const [clicked, setClicked] = useState(false);

  return (
    <Button
      onClick={() => {
        setClicked(true);
        onLogin();
      }}
      loading={clicked}
      size="l"
      className="w-full"
    >
      {t('login')}
    </Button>
  );
}

export namespace IdpLoginButton {
  export type Props = {
    onLogin: () => void;
  };
}
