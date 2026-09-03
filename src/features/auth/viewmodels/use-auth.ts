import { useCallback, useEffect, useMemo } from 'react';

import { useNavigate } from '@tanstack/react-router';

import { useTranslation } from 'react-i18next';
import { useAuthContext } from 'react-oauth2-code-pkce';
import { toast } from 'sonner';

import { ApiGender, useAuthPrompt, useToken } from '@/features/auth';

import { useLogin, useLogout, useUser } from '.';

export const useAuth = ({ showToast = false }: { showToast?: boolean } = {}) => {
  const {
    token: idpToken,
    logIn: idpLogIn,
    logOut: idpLogOut,
    loginInProgress,
  } = useAuthContext();
  const { mutate: logInMutate, ...logInMutation } = useLogin({ showToast: true });
  const { mutate: logOut, ...logOutMutation } = useLogout({ showToast });
  const { token } = useToken();
  const { data: userData, isLoading, error: userError, refetch: refetchUser } = useUser();
  const { t } = useTranslation('error');
  const navigate = useNavigate();

  const logIn = useCallback(
    (...args: Parameters<typeof logInMutate>) => {
      if (!idpToken) {
        navigate({ to: '/auth' });
        if (showToast) {
          toast.error(t('noIdpToken'));
        }
        return;
      }

      return logInMutate(...args);
    },
    [idpToken, navigate, showToast, t, logInMutate],
  );

  // 성별 값을 주입받아 DTO 조립 및 API 로그인을 대행 처리하는 뷰모델 메서드
  // 백엔드가 동의 여부를 저장하지 않으므로, 앞선 약관 동의 단계에서 저장해 둔 버전을 함께 재전송한다
  const logInWithGender = useCallback(
    (gender: 'male' | 'female') => {
      const requiredConsents = useAuthPrompt.getState().requiredConsents;

      return logIn({
        body: {
          gender: gender === 'male' ? ApiGender.MALE : ApiGender.FEMALE,
          agreedToTerms: true,
          agreedToPrivacy: true,
          termsVersion: requiredConsents?.terms.requiredVersion,
          privacyVersion: requiredConsents?.privacy.requiredVersion,
        },
      });
    },
    [logIn],
  );

  // OIDC idpToken 갱신 시 전역 토큰 스토어에 동기화
  useEffect(() => {
    useToken.getState().saveIdpToken(idpToken || null);
  }, [idpToken]);

  const user = useMemo(() => {
    if (!token) {
      // IDP 세션 복원 중이거나, idpToken은 있는데 자체 재로그인이 아직 실패로 확정되지 않았다면
      // 로그아웃 상태가 아니라 판단 보류(undefined)로 취급해 /auth 화면이 잠깐 보였다가
      // 리다이렉트되는 깜빡임을 방지한다
      const isResolvingSession =
        loginInProgress || (!!idpToken && !logInMutation.isError && !logInMutation.isSuccess);

      return isResolvingSession ? undefined : null;
    }
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
  }, [
    userData,
    userError,
    isLoading,
    token,
    idpToken,
    loginInProgress,
    logInMutation.isError,
    logInMutation.isSuccess,
  ]);

  // IDP 인증이 완수된 시점에 토큰이 부재하면 1차 로그인 자동 시도
  useEffect(() => {
    if (
      idpToken &&
      !token &&
      !logInMutation.isPending &&
      !logInMutation.isError &&
      !logInMutation.isSuccess
    ) {
      logIn({ body: {} });
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
    logInWithGender,
    logOut,
    logInMutation,
    logOutMutation,
  };
};
