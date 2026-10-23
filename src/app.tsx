import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';

import { AuthProvider, type TAuthConfig } from 'react-oauth2-code-pkce';
import { Toaster } from 'sonner';

import { Loading } from '@/common/components';
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
  redirectUri: getRequiredEnv('VITE_IDP_REDIRECT_URI'),
  scope: ['email', 'student_id', 'profile'].join(' '),
  autoLogin: false,
  decodeToken: false,
  onRefreshTokenExpire: ({ logIn }) => {
    // 백엔드 세션이 유효하면 만료된 IDP 세션 때문에 다시 로그인하지 않는다.
    if (!useToken.getState().token) logIn();
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
