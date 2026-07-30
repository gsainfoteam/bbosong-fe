import { $api } from '@/common/lib';

import { ApiPaths } from '../../models';
import { useToken } from '../stores';

export const useUser = () => {
  const { token } = useToken();

  return $api.useQuery(
    'get',
    ApiPaths.AuthController_getMe,
    {},
    {
      enabled: !!token,
    },
  );
};
