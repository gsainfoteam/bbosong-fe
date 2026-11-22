import { useNavigate, useParams, useSearch } from '@tanstack/react-router';

import { useTranslation } from 'react-i18next';

import { TermsDetailScreen } from '../screens';

export function TermsDetailFrame() {
  const navigate = useNavigate();
  const { type } = useParams({ from: '/auth/terms/$type' });
  const { version } = useSearch({ from: '/auth/terms/$type' });
  const { t } = useTranslation('auth');

  const titles = {
    privacy: t('consent.termsTitle.privacy'),
    tos: t('consent.termsTitle.tos'),
  } satisfies Record<typeof type, string>;

  const handleBack = () => {
    navigate({
      to: '/auth/consent',
      state: (prev) => ({ ...prev }),
    });
  };

  return (
    <TermsDetailScreen
      title={titles[type]}
      termsUrl={`https://terms.gistory.me/embedded/bbosong/${type}/${version}/`}
      onBack={handleBack}
    />
  );
}
