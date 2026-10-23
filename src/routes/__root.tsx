import { Outlet, createRootRoute } from '@tanstack/react-router';

import { useAuthContext } from 'react-oauth2-code-pkce';

import { Loading } from '@/common/components';
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

  if (!token && loginInProgress) return <Loading />;
  return <Outlet />;
}
