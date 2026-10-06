import { useTranslation } from 'react-i18next';

import { useLogout } from '@/features/auth';

import { useFindUserProfile } from '../../viewmodels';
import { MypageScreen } from '../screens';

export function MypageFrame() {
  const { user, isError, isLoading, refetch } = useFindUserProfile();
  const { t } = useTranslation('error');

  const { mutate: logout, isPending: isLoggingOut } = useLogout({ showToast: true });

  if (isLoading) {
    return (
      <div className="bg-bg flex h-dvh w-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="bg-bg flex h-dvh w-full flex-col items-center justify-center">
        <p role="alert">{t('generic')}</p>
        <button type="button" onClick={() => void refetch()}>
          {t('refetch')}
        </button>
      </div>
    );
  }

  return (
    <>
      {/* <PushPermissionCard /> */}
      <MypageScreen user={user} onLogout={() => logout(undefined)} isLoggingOut={isLoggingOut} />
    </>
  );
}
