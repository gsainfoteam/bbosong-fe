import { createFileRoute, Navigate, Outlet, useRouter } from '@tanstack/react-router';

import { Loading } from '@/common/components';
import { useAuth } from '@/features/auth';

export const Route = createFileRoute('/_auth-required')({
  component: AuthRequiredLayout,
});

function AuthRequiredLayout() {
  const { user } = useAuth();
  const router = useRouter();

  const redirect = router.state.location.pathname + router.state.location.searchStr;

  if (user === undefined) return <Loading />;
  if (user === null) {
    return <Navigate to="/auth" search={{ redirect }} replace />;
  }

  return <Outlet />;
}
