import { Outlet, createRootRoute } from '@tanstack/react-router';

import { useAuthContext } from 'react-oauth2-code-pkce';

import { SplashScreen } from '@/common/components';
import { ErrorPage, NotFoundPage } from '@/common/pages';
import { useToken } from '@/features/auth';

export const Route = createRootRoute({
  notFoundComponent: NotFoundPage,
  errorComponent: ({ error, reset }) => <ErrorPage error={error} reset={reset} />,
  component: RootLayout,
});

function RootLayout() {
  const { loginInProgress } = useAuthContext();
  const token = useToken((state) => state.token);

  // 로그인 진행 중에는 로딩 스피너 대신 스플래시를 유지해 부팅 화면이 끊기지 않게 한다
  if (!token && loginInProgress) return <SplashScreen />;
  return <Outlet />;
}
