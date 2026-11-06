import { useCallback } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { $api } from '@/common/lib';

import { ApiPaths } from '../models';

// openapi-react-query의 키는 [method, path, init] 형태라 앞 두 요소로 prefix 매칭한다
const SUBSCRIPTIONS_QUERY_KEY = [
  'get',
  ApiPaths.NotificationController_getLaundryRoomSubscriptions,
] as const;

/**
 * 내가 신청해 둔 빈 기기 알림 구독 목록 조회.
 *
 * 알림이 발송되면 서버가 해당 구독을 자동 삭제(1회성)하므로, 목록이 바뀔 만한 시점에 `refresh`로 다시 맞춘다.
 */
export function useLaundryRoomSubscriptions() {
  const queryClient = useQueryClient();

  const query = $api.useQuery('get', ApiPaths.NotificationController_getLaundryRoomSubscriptions);

  const refresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY }),
    [queryClient],
  );

  return { ...query, refresh };
}
