import { $api } from '@/common/lib';

import { ApiPaths, type Gender, type Location } from '../models';
import {
  getDailySessionStatsQueryRange,
  type DailySessionStatsRange,
} from './daily-session-stats-range';

export type DailySessionStatsFilter = {
  location?: Location;
  gender?: Gender;
};

export function useDailySessionStats(
  days: DailySessionStatsRange,
  filter: DailySessionStatsFilter = {},
) {
  const { from, to } = getDailySessionStatsQueryRange(days);
  const { location, gender } = filter;

  return $api.useQuery(
    'get',
    ApiPaths.MachineController_getDailySessionStats,
    {
      params: {
        query: {
          from,
          to,
          ...(location ? { location } : {}),
          ...(gender ? { gender } : {}),
        },
      },
    },
    { retry: false },
  );
}
