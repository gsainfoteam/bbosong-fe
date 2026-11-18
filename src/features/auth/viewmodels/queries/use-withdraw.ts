import { useTranslation } from 'react-i18next';
import { useAuthContext } from 'react-oauth2-code-pkce';
import { toast } from 'sonner';

import { $api, resetAnalyticsUser } from '@/common/lib';

import { ApiPaths } from '../../models';
import { useToken } from '../stores';

/**
 * 회원 탈퇴. 서버가 계정을 soft-delete 하고 세션과 푸시 토큰을 무효화하므로,
 * 성공 후에는 로그아웃과 같이 로컬 토큰을 지우고 IdP 로그아웃으로 넘어간다.
 * 서버 호출은 이미 세션이 끊긴 뒤에 할 수 없으므로 로그아웃 엔드포인트는 부르지 않는다.
 */
export const useWithdraw = () => {
  const { t } = useTranslation('error');
  const { logOut: idpLogOut } = useAuthContext();

  return $api.useMutation('delete', ApiPaths.AuthController_deactivateUser, {
    onError: () => {
      toast.error(t('withdrawFailed'));
    },
    onSuccess: () => {
      resetAnalyticsUser();
      useToken.getState().saveToken(null);
      idpLogOut();
    },
  });
};
