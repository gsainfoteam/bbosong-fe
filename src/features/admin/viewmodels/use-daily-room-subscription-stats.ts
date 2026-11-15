import { $api } from '@/common/lib';

import { ApiPaths } from '../models';
import {
  getDailySessionStatsQueryRange,
  type DailySessionStatsRange,
} from './daily-session-stats-range';

export function useDailyRoomSubscriptionStats(days: DailySessionStatsRange) {
  const { from, to } = getDailySessionStatsQueryRange(days);

  return $api.useQuery(
    'get',
    ApiPaths.NotificationController_getDailyLaundryRoomNotificationStats,
    {
      params: { query: { from, to } },
    },
    { retry: false },
  );
}
