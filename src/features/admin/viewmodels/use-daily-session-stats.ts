import { $api } from '@/common/lib';

import { ApiPaths } from '../models';

import {
  getDailySessionStatsQueryRange,
  type DailySessionStatsRange,
} from './daily-session-stats-range';

export function useDailySessionStats(days: DailySessionStatsRange) {
  const { from, to } = getDailySessionStatsQueryRange(days);

  return $api.useQuery('get', ApiPaths.MachineController_getDailySessionStats, {
    params: { query: { from, to } },
  });
}
