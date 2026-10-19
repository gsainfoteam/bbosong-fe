import { useQuery } from '@tanstack/react-query';

import { api } from '@/common/lib';
import { useToken } from '@/features/auth';

import { ApiPaths, UserRole } from '../models';

export function useAdminAccess() {
  const token = useToken((state) => state.token);
  const session = useQuery({
    queryKey: ['admin-session'],
    queryFn: async () => {
      const { data } = await api.POST(ApiPaths.AuthController_refresh);
      if (data) useToken.getState().saveToken(data.access_token);
      return !!data;
    },
    enabled: !token,
    retry: false,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });
  const profile = useQuery({
    queryKey: ['admin-profile', token],
    queryFn: async () => {
      const { data, error } = await api.GET(ApiPaths.AuthController_getMe);
      if (error) throw error;
      return data;
    },
    enabled: !!token,
    retry: false,
  });

  return {
    isLoading: token ? profile.isPending : session.isFetching,
    isAdmin: !!token && profile.data?.role === UserRole.ADMIN && !profile.isError,
    user: token ? profile.data : undefined,
  };
}
