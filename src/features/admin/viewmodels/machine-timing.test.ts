// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useMachineTiming } from './machine-timing';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-25T00:00:00Z'));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
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
