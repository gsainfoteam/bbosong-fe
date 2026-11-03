import { useEffect } from 'react';

import { identifyAnalyticsUser, resetAnalyticsUser } from '@/common/lib';

/**
 * 로그인 사용자를 Amplitude에 식별시키는 훅.
 *
 * 내 정보 조회는 인증 레이아웃에서 이미 하고 있으므로 중복 요청을 만들지 않도록 조회 결과를 받아 쓴다.
 * - 사용자 객체: 식별한다
 * - null: 세션이 끝났으므로 식별을 해제한다 (세션 만료, 새로고침 시 복원 실패 등)
 * - undefined: 확인 중이거나 조회 오류이므로 기존 식별을 유지한다
 */
export function useAnalyticsIdentity(user: useAnalyticsIdentity.User | null | undefined): void {
  const isSignedOut = user === null;
  const uuid = user?.uuid;
  const role = user?.role;
  const gender = user?.gender;

  useEffect(() => {
    if (isSignedOut) {
      resetAnalyticsUser();
      return;
    }
    if (!uuid) return;

    identifyAnalyticsUser(uuid, { role: role ?? '', gender: gender ?? '' });
  }, [isSignedOut, uuid, role, gender]);
}

export namespace useAnalyticsIdentity {
  export type User = { uuid: string; role?: string; gender?: string };
}
