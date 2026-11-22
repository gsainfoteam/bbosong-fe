import { Link } from '@tanstack/react-router';

import { CloudAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button, StatusScreen } from '@/common/components';

export function ErrorPage({ error, reset, home = true }: ErrorPage.Props) {
  const { t } = useTranslation('error');

  return (
    <StatusScreen
      role="alert"
      icon={CloudAlert}
      title={t('page.errorTitle')}
      description={t('page.errorDescription')}
      detail={error?.message}
    >
      {home && (
        <Button asChild size="l" variant={reset ? 'secondary' : 'primary'}>
          <Link to="/">{t('page.home')}</Link>
        </Button>
      )}
      {reset && (
        <Button type="button" size="l" onClick={reset}>
          {t('refetch')}
        </Button>
      )}
    </StatusScreen>
  );
}

export namespace ErrorPage {
  export type Props = {
    error?: Error;
    reset?: () => void;
    home?: boolean;
  };
}
