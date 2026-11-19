import { describe, expect, it } from 'vitest';

import { fillUsageStatsBuckets } from './usage-stats-buckets';

describe('fillUsageStatsBuckets', () => {
  it('fills all 24 hours and zeroes the missing ones', () => {
    const result = fillUsageStatsBuckets(
      [
        { hour: 9, sessionCount: 3 },
        { hour: 22, sessionCount: 5 },
      ],
      'hour',
    );
    expect(result).toHaveLength(24);
    expect(result[9]).toEqual({ key: 9, sessionCount: 3 });
    expect(result[22]).toEqual({ key: 22, sessionCount: 5 });
    expect(result[0]).toEqual({ key: 0, sessionCount: 0 });
  });

  it('fills ISO weekdays 1..7 in order', () => {
    const result = fillUsageStatsBuckets([{ weekday: 7, sessionCount: 2 }], 'weekday');
    expect(result.map((bucket) => bucket.key)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(result[6]?.sessionCount).toBe(2);
  });

  it('returns all zeros for empty data', () => {
    expect(fillUsageStatsBuckets([], 'weekday').every((bucket) => bucket.sessionCount === 0)).toBe(
      true,
    );
  });
});
