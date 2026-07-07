import { Outlet, createRootRoute } from '@tanstack/react-router';

import { ErrorPage, NotFoundPage } from '@/common/pages';

export const Route = createRootRoute({
  notFoundComponent: NotFoundPage,
  errorComponent: ({ error, reset }) => <ErrorPage error={error} reset={reset} />,
  component: () => <Outlet />,
});
