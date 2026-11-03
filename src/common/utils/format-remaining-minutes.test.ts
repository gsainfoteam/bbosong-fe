import { describe, expect, it } from 'vitest';

import { formatRemainingMinutes, resolveRemainingMinutes } from './format-remaining-minutes';

describe('formatRemainingMinutes', () => {
  it('splits minutes into hours and minutes', () => {
    expect(formatRemainingMinutes(90)).toEqual({ hours: 1, minutes: 30 });
    expect(formatRemainingMinutes(45)).toEqual({ hours: 0, minutes: 45 });
    expect(formatRemainingMinutes(0)).toEqual({ hours: 0, minutes: 0 });
    expect(formatRemainingMinutes(120)).toEqual({ hours: 2, minutes: 0 });
  });

  it('floors fractional and negative values', () => {
    expect(formatRemainingMinutes(90.9)).toEqual({ hours: 1, minutes: 30 });
    expect(formatRemainingMinutes(-5)).toEqual({ hours: 0, minutes: 0 });
  });
});

describe('resolveRemainingMinutes', () => {
  it('prefers thinqRemainingMinutes over currentUsage.remainingMinutes', () => {
    expect(
      resolveRemainingMinutes({
        thinqRemainingMinutes: 20,
        currentUsage: { remainingMinutes: 10 },
      }),
    ).toBe(20);
  });

  it('falls back to currentUsage.remainingMinutes', () => {
    expect(
      resolveRemainingMinutes({
        thinqRemainingMinutes: null,
        currentUsage: { remainingMinutes: 15 },
      }),
    ).toBe(15);
  });

  it('returns null when neither value is a number', () => {
    expect(resolveRemainingMinutes({ thinqRemainingMinutes: null, currentUsage: null })).toBeNull();
    expect(resolveRemainingMinutes({})).toBeNull();
  });
});
