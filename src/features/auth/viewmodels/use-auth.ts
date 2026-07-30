import { useCallback, useEffect, useMemo } from 'react';

import { useNavigate } from '@tanstack/react-router';

import { useTranslation } from 'react-i18next';
import { useAuthContext } from 'react-oauth2-code-pkce';
import { toast } from 'sonner';

import { useToken, useAuthRedirect } from '@/features/auth';

import { useLogin, useLogout, useUser } from '.';

export const useAuth = ({ showToast = false }: { showToast?: boolean } = {}) => {
  const { token: idpToken, logIn: idpLogIn, logOut: idpLogOut } = useAuthContext();
  const { mutate: logInMutate, ...logInMutation } = useLogin({ showToast: true });
  const { mutate: logOut, ...logOutMutation } = useLogout({ showToast });
  const { token } = useToken();
  const { data: userData, isLoading, error: userError, refetch: refetchUser } = useUser();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const logIn = useCallback(
    (...args: Parameters<typeof logInMutate>) => {
      if (!idpToken) {
        navigate({ to: '/auth' });
        if (showToast) {
          toast.error(t('error.noIdpToken'));
        }
        return;
      }

      return logInMutate(...args);
    },
    [idpToken, navigate, showToast, t, logInMutate],
  );

  const user = useMemo(() => {
    if (!token) return null;
    if (isLoading) return undefined;
    if (userError) return null;
    return userData;
  }, [userData, userError, isLoading, token]);

  // IDP 인증이 끝났으나 자체 토큰이 없는 경우 자동으로 1차 로그인 시도
  useEffect(() => {
    if (
      idpToken &&
      !token &&
      !logInMutation.isPending &&
      !logInMutation.isError &&
      !logInMutation.isSuccess
    ) {
      logIn({
        body: {
          agreedToTerms: true,
          agreedToPrivacy: true,
          termsVersion: '260301',
          privacyVersion: '260301',
        },
        params: {
          header: {
            Authorization: `Bearer ${idpToken}`,
          },
        },
      } as unknown as Parameters<typeof logIn>[0]);
    }
  }, [
    idpToken,
    token,
    logIn,
    logInMutation.isPending,
    logInMutation.isError,
    logInMutation.isSuccess,
  ]);

  // 자체 토큰 발급에 성공한 경우 목적지 리다이렉트 처리
  useEffect(() => {
    if (token) {
      const targetRedirect = useAuthRedirect.getState().redirect || '/';
      useAuthRedirect.getState().clearRedirect();
      navigate({ to: targetRedirect });
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;

    refetchUser();
  }, [refetchUser, token]);

  return {
    user,
    refetchUser,
    idpToken,
    idpLogIn,
    idpLogOut,
    logIn,
    logOut,
    logInMutation,
    logOutMutation,
  };
};
