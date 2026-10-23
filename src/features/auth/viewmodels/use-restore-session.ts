import { useQuery } from '@tanstack/react-query';

import { api } from '@/common/lib';

import { ApiPaths } from '../models';
import { useToken } from './stores';

export function useRestoreSession() {
  const session = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      if (useToken.getState().token) return true;

      const { data } = await api.POST(ApiPaths.AuthController_refresh);
      if (data) useToken.getState().saveToken(data.access_token);
      return !!data;
    },
    // 부팅 시 한 번만 복원한다. 로그아웃이나 레이아웃 재마운트로 다시 로그인하지 않는다.
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    retryOnMount: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return { isRestoring: session.isPending };
}
