import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';

import { AuthProvider, type TAuthConfig } from 'react-oauth2-code-pkce';
import { Toaster } from 'sonner';

import { Loading } from '@/common/components';
import { isNativeApp, NATIVE_AUTH_REDIRECT_URI } from '@/common/lib/platform';
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
      <SessionRouter />
    </QueryClientProvider>
  );
}

function SessionRouter() {
  const { isRestoring } = useRestoreSession();
  if (isRestoring) return <Loading />;

  return (
    <AuthProvider authConfig={authConfig}>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
