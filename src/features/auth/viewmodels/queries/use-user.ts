import { $api } from '@/common/lib';

import { ApiPaths } from '../../models';
import { useToken } from '../stores';

export const useUser = () => {
  const { token } = useToken();

  return $api.useQuery('get', ApiPaths.AuthController_getMe, undefined, {
    enabled: !!token,
    retry(count, queryError) {
      if (queryError?.statusCode === 404 || queryError?.statusCode === 400) return false;
      return count < 3;
    },
  });
};
