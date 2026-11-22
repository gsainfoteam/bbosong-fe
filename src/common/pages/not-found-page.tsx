import { Link } from '@tanstack/react-router';

import { SearchX } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button, StatusScreen } from '@/common/components';

export function NotFoundPage() {
  const { t } = useTranslation('error');

  return (
    <StatusScreen
      icon={SearchX}
      title={t('page.notFoundTitle')}
      description={t('page.notFoundDescription')}
    >
      <Button asChild size="l">
        <Link to="/">{t('page.home')}</Link>
      </Button>
    </StatusScreen>
  );
}
