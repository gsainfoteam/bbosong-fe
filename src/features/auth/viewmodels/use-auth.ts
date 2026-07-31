import { useCallback, useEffect, useMemo } from 'react';

import { useNavigate } from '@tanstack/react-router';

import { useTranslation } from 'react-i18next';
import { useAuthContext } from 'react-oauth2-code-pkce';
import { toast } from 'sonner';

import { useToken } from '@/features/auth';

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

  // OIDC idpToken 갱신 시 전역 토큰 스토어에 동기화
  useEffect(() => {
    useToken.getState().saveIdpToken(idpToken || null);
  }, [idpToken]);

  const user = useMemo(() => {
    if (!token) return null;
    if (isLoading) return undefined;

    if (userError) {
      const err = userError as { status?: number; statusCode?: number };
      const status = err?.status ?? err?.statusCode;

      // 401 에러 시에만 세션을 소멸시키고 미인증(null) 처리
      if (status === 401) {
        useToken.getState().saveToken(null);
        return null;
      }

      return userError;
    }

    return userData;
  }, [userData, userError, isLoading, token]);

  // IDP 인증이 완수된 시점에 토큰이 부재하면 1차 로그인 자동 시도
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
          termsVersion: '260731',
          privacyVersion: '260731',
        },
      });
    }
  }, [
    idpToken,
    token,
    logIn,
    logInMutation.isPending,
    logInMutation.isError,
    logInMutation.isSuccess,
  ]);

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
