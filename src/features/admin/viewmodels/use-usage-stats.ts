import { $api } from '@/common/lib';

import {
  ApiPaths,
  UsageStatsGroupBy,
  type Gender,
  type Location,
  type MachineType,
} from '../models';
import {
  getDailySessionStatsQueryRange,
  type DailySessionStatsRange,
} from './daily-session-stats-range';
import { type UsageStatsDimension } from './usage-stats-buckets';

export type UsageStatsFilter = {
  location?: Location;
  gender?: Gender;
  type?: MachineType;
};

export function useUsageStats(
  dimension: UsageStatsDimension,
  days: DailySessionStatsRange,
  filter: UsageStatsFilter = {},
) {
  const { from, to } = getDailySessionStatsQueryRange(days);
  const { location, gender, type } = filter;

  return $api.useQuery(
    'get',
    ApiPaths.MachineController_getUsageStats,
    {
      params: {
        query: {
          from,
          to,
          groupBy: [UsageStatsGroupBy[dimension]],
          ...(location ? { location } : {}),
          ...(gender ? { gender } : {}),
          ...(type ? { type } : {}),
        },
      },
    },
    { retry: false },
  );
}
