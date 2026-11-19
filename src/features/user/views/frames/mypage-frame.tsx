import { useTranslation } from 'react-i18next';

import { SplashScreen } from '@/common/components';
import { useLogout, useWithdraw } from '@/features/auth';

import { useFindUserProfile } from '../../viewmodels';
import { MypageScreen } from '../screens';

export function MypageFrame() {
  const { user, isError, isLoading, refetch } = useFindUserProfile();
  const { t } = useTranslation('error');

  const { mutate: logout, isPending: isLoggingOut } = useLogout({ showToast: true });
  const { mutate: withdraw, isPending: isWithdrawing } = useWithdraw();

  if (isLoading) {
    return <SplashScreen />;
  }

  if (isError || !user) {
    return (
      <div className="bg-bg flex w-full flex-1 flex-col items-center justify-center">
        <p role="alert">{t('generic')}</p>
        <button type="button" onClick={() => void refetch()}>
          {t('refetch')}
        </button>
      </div>
    );
  }

  return (
    <MypageScreen
      user={user}
      onLogout={() => logout(undefined)}
      isLoggingOut={isLoggingOut}
      onWithdraw={() => withdraw(undefined)}
      isWithdrawing={isWithdrawing}
    />
  );
}
