import { useTranslation } from 'react-i18next';
import { useAuthContext } from 'react-oauth2-code-pkce';
import { toast } from 'sonner';

import { $api } from '@/common/lib';

import { ApiPaths } from '../../models';
import { useToken } from '../stores';

export const useLogout = ({ showToast = false }: { showToast?: boolean } = {}) => {
  const { t } = useTranslation('error');
  const { logOut: idpLogOut } = useAuthContext();

  return $api.useMutation('post', ApiPaths.AuthController_logout, {
    // 토큰이 살아 있는 동안 먼저 푸시 등록을 해제해야 한다.
    // 순서가 뒤바뀌면 401로 실패해 그 기기에 이전 계정의 알림이 계속 발송된다.
    // (push-notification -> common/lib/api -> features/auth 순환 참조를 피하려고 동적 import를 쓴다)
    onMutate: async () => {
      const { unregisterPushDeviceFromServer } = await import('@/features/push-notification');

      // 내부에서 예외를 삼키므로 해제 실패가 로그아웃을 막지 않는다
      await unregisterPushDeviceFromServer();
    },
    onError: () => {
      if (showToast) {
        toast.error(t('logoutFailed'));
      }
    },
    onSettled: () => {
      useToken.getState().saveToken(null);
      idpLogOut();
    },
  });
};
