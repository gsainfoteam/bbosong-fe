import { describe, expect, it } from 'vitest';

import { getDailySessionStatsQueryRange } from './daily-session-stats-range';

describe('getDailySessionStatsQueryRange', () => {
  // 2026-11-12 15:30 KST = 2026-11-12 06:30 UTC
  const now = new Date('2026-11-12T06:30:00.000Z');

  it.each([
    [7, '2026-11-06', '2026-11-12'],
    [14, '2026-10-30', '2026-11-12'],
    [30, '2026-10-14', '2026-11-12'],
    [90, '2026-08-15', '2026-11-12'],
  ] as const)('returns inclusive KST range for %i days', (days, from, to) => {
    expect(getDailySessionStatsQueryRange(days, now)).toEqual({ from, to });
  });

  it('uses KST calendar date when UTC is still the previous day', () => {
    // 2026-11-12 00:30 KST = 2026-11-11 15:30 UTC
    const earlyKst = new Date('2026-11-11T15:30:00.000Z');
    expect(getDailySessionStatsQueryRange(7, earlyKst)).toEqual({
      from: '2026-11-06',
      to: '2026-11-12',
    });
  });
});
