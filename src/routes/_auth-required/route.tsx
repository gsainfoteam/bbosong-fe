import { useEffect, useState } from 'react';

import { createFileRoute, Navigate, Outlet, useRouter } from '@tanstack/react-router';

import { Loading } from '@/common/components';
import { useAuth } from '@/features/auth';

export const Route = createFileRoute('/_auth-required')({
  component: AuthRequiredLayout,
});

function AuthRequiredLayout() {
  const { user } = useAuth();
  const router = useRouter();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const redirect = router.state.location.pathname + router.state.location.searchStr;

  // 렌더링 프레임 간의 마운트 동기화 딜레이 완충용 이펙트 가드
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user === null) {
        setShouldRedirect(true);
      } else {
        setShouldRedirect(false);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [user]);

  if (user === undefined) return <Loading />;

  if (shouldRedirect) {
    return <Navigate to="/auth" search={{ redirect }} replace />;
  }

  return <Outlet />;
}
