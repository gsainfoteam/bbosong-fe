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

  // 정상적으로 인증이 통과된 사용자만 Outlet 렌더링을 허용
  if (user !== null && !shouldRedirect) {
    return <Outlet />;
  }

  // 미인증 및 퇴출 완료 시점에만 Navigate 탈출 가동
  if (user === null && shouldRedirect) {
    return <Navigate to="/auth" search={{ redirect }} replace />;
  }

  // 싱크 갭 등의 대기 찰나에는 Outlet 노출 가드 후 대기
  return <Loading />;
}
