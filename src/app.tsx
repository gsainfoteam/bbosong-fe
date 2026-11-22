import { useEffect } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';

import { AuthProvider, type TAuthConfig } from 'react-oauth2-code-pkce';

import { SplashScreen, StoreDownloadModal, Toaster } from '@/common/components';
import { subscribeToNativeNotificationTap } from '@/common/lib/native-push';
import { hideSplashScreen, isNativeApp, NATIVE_AUTH_REDIRECT_URI } from '@/common/lib/platform';
import { useRestoreSession, useToken } from '@/features/auth';

import { queryClient, router } from './router';

const getRequiredEnv = (key: string): string => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value as string;
};

const authConfig: TAuthConfig = {
  clientId: getRequiredEnv('VITE_IDP_CLIENT_ID'),
  authorizationEndpoint: getRequiredEnv('VITE_IDP_AUTHORIZE_URL'),
  tokenEndpoint: getRequiredEnv('VITE_IDP_TOKEN_URL'),
  redirectUri: isNativeApp() ? NATIVE_AUTH_REDIRECT_URI : getRequiredEnv('VITE_IDP_REDIRECT_URI'),
  scope: ['email', 'student_id', 'profile'].join(' '),
  // 네이티브는 인앱 브라우저로 로그인한다 (platform.ts의 window.open 연결 참고).
  // 수동 logIn()은 이 값을 무시하므로 useAuth/onRefreshTokenExpire에서도 'popup'을 지정한다.
  // 초기 토큰 갱신 실패 시 라이브러리 내부가 이 값으로 logIn을 호출한다.
  loginMethod: isNativeApp() ? 'popup' : 'redirect',
  autoLogin: false,
  decodeToken: false,
  onRefreshTokenExpire: ({ logIn }) => {
    // 백엔드 세션이 유효하면 만료된 IDP 세션 때문에 다시 로그인하지 않는다.
    if (!useToken.getState().token)
      logIn(undefined, undefined, isNativeApp() ? 'popup' : undefined);
  },
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <StoreDownloadModal />
      <SessionRouter />
    </QueryClientProvider>
  );
}

function SessionRouter() {
  const { isRestoring } = useRestoreSession();

  // 네이티브 정적 스플래시를 바로 내리고, 복원 중에는 웹 스플래시(움직이는 로고)를 보여준다
  useEffect(() => {
    hideSplashScreen();
  }, []);

  // 알림 탭 이동은 세션 복원 뒤에 구독한다. 복원 전에 이동하면 인증 가드가 토큰 없이 /auth로 보낸다.
  // 로그인 전에 탭하면 가드가 /auth?redirect=...로 보내 로그인 후 해당 경로로 돌아온다
  useEffect(() => {
    if (isRestoring) return;

    return subscribeToNativeNotificationTap((href) => void router.navigate({ href }));
  }, [isRestoring]);

  if (isRestoring) return <SplashScreen />;

  return (
    <AuthProvider authConfig={authConfig}>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
