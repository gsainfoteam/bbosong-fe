import { useCallback, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

/**
 * 메인 화면 데이터 새로고침.
 *
 * 화면에 마운트된 쿼리(사용자, 기기 목록, 사용 중 기기, 알림 구독 등)를 전부 다시 불러온다.
 * 쿼리를 하나씩 나열하면 화면에 쿼리가 추가될 때마다 빠뜨리기 쉬우므로 active 쿼리 단위로 처리한다.
 */
export function useRefreshMainData() {
  const { t } = useTranslation('error');
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 백그라운드 리페치까지 로딩으로 보이지 않도록 사용자가 누른 새로고침만 추적한다
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 기본값으로는 실패해도 resolve되어, 이전 데이터가 남은 채 새로고침이 끝난 것처럼 보인다
      await queryClient.refetchQueries({ type: 'active' }, { throwOnError: true });
    } catch {
      toast.error(t('generic'));
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, t]);

  return { isRefreshing, refresh };
}
