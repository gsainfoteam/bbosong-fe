import { useNavigate } from '@tanstack/react-router';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { SplashScreen } from '@/common/components';
import { ErrorPage } from '@/common/pages';
import { useLogout, useWithdraw } from '@/features/auth';
import {
  type NotificationSettingRow,
  useInstallPrompt,
  usePushPermission,
} from '@/features/push-notification';

import { useAppVersions, useFindUserProfile } from '../../viewmodels';
import { MypageScreen } from '../screens';

function useNotificationSetting(): NotificationSettingRow.Props {
  const { t } = useTranslation('notification');
  const { status, isRequesting, requestPermission, isNative } = usePushPermission();
  const { canPrompt, isPrompting, promptInstall, showManualGuide, isIOS, isAndroid } =
    useInstallPrompt();

  const manualGuide = (() => {
    if (isIOS) return t('permission.installGuideIOS');
    if (!showManualGuide) return undefined;
    return isAndroid ? t('permission.installGuideAndroid') : t('permission.installGuideFallback');
  })();

  return {
    status,
    isNative,
    isBusy: isRequesting || isPrompting,
    onEnable: () => void requestPermission(),
    onTurnOffHint: () => toast(t('permission.turnOffGuide')),
    onInstall: !isIOS && (canPrompt || isPrompting) ? () => void promptInstall() : undefined,
    installGuide: manualGuide,
  };
}

export function MypageFrame() {
  const navigate = useNavigate();
  const { user, isError, isLoading, refetch } = useFindUserProfile();
  const notification = useNotificationSetting();
  const versions = useAppVersions();

  const { mutate: logout, isPending: isLoggingOut } = useLogout({ showToast: true });
  const { mutate: withdraw, isPending: isWithdrawing } = useWithdraw();

  if (isLoading) {
    return <SplashScreen />;
  }

  if (isError || !user) {
    return <ErrorPage reset={() => void refetch()} />;
  }

  return (
    <MypageScreen
      user={user}
      notification={notification}
      versions={versions}
      onBack={() => void navigate({ to: '/' })}
      onLogout={() => logout(undefined)}
      isLoggingOut={isLoggingOut}
      onWithdraw={() => withdraw(undefined)}
      isWithdrawing={isWithdrawing}
    />
  );
}
