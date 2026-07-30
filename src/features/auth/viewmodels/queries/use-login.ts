import { useNavigate } from '@tanstack/react-router';

import { useTranslation } from 'react-i18next';
import { useAuthContext } from 'react-oauth2-code-pkce';
import { toast } from 'sonner';

import { $api } from '@/common/lib';
import { useToken } from '@/features/auth';

import { ApiPaths } from '../../models';

export const useLogin = ({ showToast = false }: { showToast?: boolean } = {}) => {
  const { t } = useTranslation();
  const { logOut: idpLogOut } = useAuthContext();
  const navigate = useNavigate();

  return $api.useMutation('post', ApiPaths.AuthController_login, {
    onSuccess: (response) => {
      useToken.getState().saveToken(response.access_token);
    },
    onError: async (error) => {
      const err = error as { statusCode?: number; status?: number };
      const isGenderRequired = err?.statusCode === 403 || err?.status === 403;

      if (isGenderRequired) {
        navigate({ to: '/auth/gender' });
        return;
      }

      idpLogOut();
      navigate({ to: '/auth' });
      console.error(error);
      if (showToast) {
        toast.error(t('error.loginFailed'));
      }
    },
  });
};
