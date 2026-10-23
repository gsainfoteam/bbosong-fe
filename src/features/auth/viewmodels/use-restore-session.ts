import { useQuery } from '@tanstack/react-query';

import { api } from '@/common/lib';

import { ApiPaths } from '../models';
import { useToken } from './stores';

export function useRestoreSession() {
  const session = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      if (useToken.getState().token) return true;

      const { data, error, response } = await api.POST(ApiPaths.AuthController_refresh, {
        signal: AbortSignal.timeout(10_000),
      });
      if (response.status === 401) return false;
      if (error) throw error;
      if (!data) throw new Error('Session refresh returned no access token');

      useToken.getState().saveToken(data.access_token);
      return true;
    },
    // 부팅 복원만 제한적으로 재시도한다. 로그아웃이나 레이아웃 재마운트로 다시 로그인하지 않는다.
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 2,
    retryOnMount: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return { isRestoring: session.isPending };
}
