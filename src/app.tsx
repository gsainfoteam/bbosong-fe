import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';

import { AuthProvider, type TAuthConfig } from 'react-oauth2-code-pkce';
import { Toaster } from 'sonner';

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
};

export function App() {
  return (
    <AuthProvider authConfig={authConfig}>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <RouterProvider router={router} />
      </QueryClientProvider>
    </AuthProvider>
  );
}
