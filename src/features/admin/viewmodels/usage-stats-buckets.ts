import { type UsageStat } from '../models';

export type UsageStatsDimension = 'hour' | 'weekday';

export type UsageStatsBucket = { key: number; sessionCount: number };

const BUCKET_KEYS: Record<UsageStatsDimension, readonly number[]> = {
  hour: Array.from({ length: 24 }, (_, index) => index),
  // ISO weekday: 1=Mon … 7=Sun
  weekday: [1, 2, 3, 4, 5, 6, 7],
};

/** The API only returns groups that have sessions, so fill the empty buckets with zero. */
export function fillUsageStatsBuckets(
  data: readonly UsageStat[],
  dimension: UsageStatsDimension,
): UsageStatsBucket[] {
  const counts = new Map<number, number>();
  for (const row of data) {
    const key = row[dimension];
    if (typeof key === 'number') counts.set(key, (counts.get(key) ?? 0) + row.sessionCount);
  }
  return BUCKET_KEYS[dimension].map((key) => ({ key, sessionCount: counts.get(key) ?? 0 }));
}
