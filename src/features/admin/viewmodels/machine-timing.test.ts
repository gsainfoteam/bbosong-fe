// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type AdminMachine } from '../models';
import {
  formatThinqRemainingParts,
  getMachineThinqRemainingMinutes,
  isMachineThinqRemainingDetecting,
  useMachineTiming,
} from './machine-timing';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-25T00:00:00Z'));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('formatThinqRemainingParts', () => {
  it('splits remaining minutes into hours and minutes', () => {
    expect(formatThinqRemainingParts(90)).toEqual({ hours: 1, minutes: 30 });
    expect(formatThinqRemainingParts(20)).toEqual({ hours: 0, minutes: 20 });
  });

  it('returns null when remaining minutes are unavailable', () => {
    expect(formatThinqRemainingParts(null)).toBeNull();
  });
});

describe('getMachineThinqRemainingMinutes', () => {
  it('returns remaining minutes only for ThinQ-mapped machines', () => {
    expect(
      getMachineThinqRemainingMinutes({
        thinqDeviceId: 'device-1',
        thinqRemainingMinutes: 45,
        status: 'DRY',
      } as AdminMachine),
    ).toBe(45);
    expect(
      getMachineThinqRemainingMinutes({
        thinqDeviceId: null,
        thinqRemainingMinutes: 45,
        status: 'DRY',
      } as AdminMachine),
    ).toBeNull();
  });

  it('returns null while ThinQ remaining is detecting', () => {
    expect(
      getMachineThinqRemainingMinutes({
        thinqDeviceId: 'device-1',
        thinqCurrentState: 'DETECTING',
        thinqRemainingMinutes: null,
        status: 'DRY',
      } as AdminMachine),
    ).toBeNull();
  });
});

describe('isMachineThinqRemainingDetecting', () => {
  it('detects DETECTING ThinQ dryers', () => {
    expect(
      isMachineThinqRemainingDetecting({
        thinqDeviceId: 'device-1',
        thinqCurrentState: 'DETECTING',
        status: 'DRY',
      } as AdminMachine),
    ).toBe(true);
  });
});

describe('useMachineTiming', () => {
  it('refreshes when enabled after a long wait with no machines', () => {
    const { result, rerender } = renderHook(useMachineTiming, { initialProps: false });
    act(() => vi.advanceTimersByTime(5 * 60_000));

    rerender(true);
    act(() => vi.advanceTimersByTime(0));

    expect(result.current).toBe(Date.now());
    act(() => vi.advanceTimersByTime(30_000));
    expect(result.current).toBe(Date.now());
  });

  it('stops while disabled and refreshes when enabled again', () => {
    const { result, rerender, unmount } = renderHook(useMachineTiming, { initialProps: true });
    act(() => vi.advanceTimersByTime(30_000));
    const lastTick = result.current;

    rerender(false);
    act(() => vi.advanceTimersByTime(5 * 60_000));
    expect(result.current).toBe(lastTick);

    rerender(true);
    act(() => vi.advanceTimersByTime(0));
    expect(result.current).toBe(Date.now());

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
