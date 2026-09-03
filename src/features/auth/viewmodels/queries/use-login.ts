import { useNavigate } from '@tanstack/react-router';

import { useTranslation } from 'react-i18next';
import { useAuthContext } from 'react-oauth2-code-pkce';
import { toast } from 'sonner';

import { $api } from '@/common/lib';
import { useAuthPrompt, useToken } from '@/features/auth';

import { ApiPaths } from '../../models';

import type { ConsentRequiredErrorDto, GenderRequiredErrorDto } from '../../models';

export const useLogin = ({ showToast = false }: { showToast?: boolean } = {}) => {
  const { t } = useTranslation('error');
  const { logOut: idpLogOut } = useAuthContext();
  const navigate = useNavigate();

  return $api.useMutation('post', ApiPaths.AuthController_login, {
    onSuccess: (response) => {
      useToken.getState().saveToken(response.access_token);
    },
    onError: async (error) => {
      const err = error as ConsentRequiredErrorDto | GenderRequiredErrorDto | { statusCode?: number };

      if ('errorCode' in err && err.errorCode === 'GENDER_REQUIRED') {
        navigate({ to: '/auth/gender' });
        return;
      }

      if (
        'errorCode' in err &&
        (err.errorCode === 'CONSENT_REQUIRED' || err.errorCode === 'CONSENT_UPDATE_REQUIRED')
      ) {
        useAuthPrompt.getState().setRequiredConsents(err.requiredConsents);
        navigate({ to: '/auth/consent' });
        return;
      }

      idpLogOut();
      navigate({ to: '/auth' });
      console.error(error);
      if (showToast) {
        toast.error(t('loginFailed'));
      }
    },
  });
};
