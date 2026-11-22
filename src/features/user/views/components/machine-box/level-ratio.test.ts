import { describe, expect, it } from 'vitest';

import { levelRatio, MIN_LEVEL } from './level-ratio';

describe('levelRatio', () => {
  it('uses remaining ÷ (elapsed + remaining)', () => {
    expect(levelRatio(41, 17)).toBeCloseTo(41 / 58);
    expect(levelRatio(30, 30)).toBeCloseTo(0.5);
  });

  it('is full when the elapsed time is unknown', () => {
    expect(levelRatio(41, undefined)).toBe(1);
  });

  it('is full right after the cycle starts', () => {
    expect(levelRatio(60, 0)).toBe(1);
  });

  describe('almost done: never drops below the floor', () => {
    it('clamps to the floor when the ratio is under it', () => {
      expect(levelRatio(4, 90)).toBe(MIN_LEVEL);
    });

    it('stays on the floor when nothing remains', () => {
      expect(levelRatio(0, 60)).toBe(MIN_LEVEL);
    });

    it('stays on the floor when both times are zero', () => {
      expect(levelRatio(0, 0)).toBe(MIN_LEVEL);
    });

    it('reaches the floor exactly at the boundary', () => {
      expect(levelRatio(6, 94)).toBeCloseTo(MIN_LEVEL);
    });

    it('does not clamp while the ratio is above the floor', () => {
      // 4 ÷ 60 ≈ 6.7%
      expect(levelRatio(4, 56)).toBeGreaterThan(MIN_LEVEL);
      expect(levelRatio(4, 56)).toBeCloseTo(4 / 60);
    });
  });

  it('never exceeds full even if the elapsed time is negative', () => {
    expect(levelRatio(10, -5)).toBe(1);
  });
});
