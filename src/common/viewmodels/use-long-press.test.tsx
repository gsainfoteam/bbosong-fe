// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type LongPressHandlers, useLongPress } from './use-long-press';

type Handlers = LongPressHandlers;

const pointer = (x = 0, y = 0, extra: object = {}) =>
  ({ clientX: x, clientY: y, pointerType: 'touch', button: 0, ...extra }) as never;

describe('useLongPress', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const setup = (callback: (() => void) | undefined = vi.fn()) => {
    const hook = renderHook(() => useLongPress(callback, { delay: 500, moveTolerance: 10 }));
    return { ...hook, handlers: () => hook.result.current as Handlers, callback };
  };

  it('fires once after the delay while held still', () => {
    const { handlers, callback } = setup();

    act(() => handlers().onPointerDown(pointer(5, 5)));
    act(() => vi.advanceTimersByTime(499));
    expect(callback).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(callback).toHaveBeenCalledOnce();

    act(() => vi.advanceTimersByTime(2000));
    expect(callback).toHaveBeenCalledOnce();
  });

  it('does not fire for a short tap', () => {
    const { handlers, callback } = setup();

    act(() => handlers().onPointerDown(pointer()));
    act(() => vi.advanceTimersByTime(200));
    act(() => handlers().onPointerUp());
    act(() => vi.advanceTimersByTime(1000));

    expect(callback).not.toHaveBeenCalled();
  });

  it.each(['onPointerLeave', 'onPointerCancel'] as const)('is cancelled by %s', (name) => {
    const { handlers, callback } = setup();

    act(() => handlers().onPointerDown(pointer()));
    act(() => handlers()[name]());
    act(() => vi.advanceTimersByTime(1000));

    expect(callback).not.toHaveBeenCalled();
  });

  it('is cancelled when the pointer moves beyond the tolerance (scrolling)', () => {
    const { handlers, callback } = setup();

    act(() => handlers().onPointerDown(pointer(0, 0)));
    act(() => handlers().onPointerMove(pointer(0, 11)));
    act(() => vi.advanceTimersByTime(1000));

    expect(callback).not.toHaveBeenCalled();
  });

  it('survives small finger jitter', () => {
    const { handlers, callback } = setup();

    act(() => handlers().onPointerDown(pointer(0, 0)));
    act(() => handlers().onPointerMove(pointer(3, 4)));
    act(() => vi.advanceTimersByTime(500));

    expect(callback).toHaveBeenCalledOnce();
  });

  it('ignores non-primary mouse buttons', () => {
    const { handlers, callback } = setup();

    act(() => handlers().onPointerDown(pointer(0, 0, { pointerType: 'mouse', button: 2 })));
    act(() => vi.advanceTimersByTime(1000));

    expect(callback).not.toHaveBeenCalled();
  });

  it('swallows the click that follows a long press, only once', () => {
    const { handlers } = setup();
    const click = () => ({ preventDefault: vi.fn(), stopPropagation: vi.fn() });

    act(() => handlers().onPointerDown(pointer()));
    act(() => vi.advanceTimersByTime(500));

    const first = click();
    handlers().onClickCapture(first as never);
    expect(first.preventDefault).toHaveBeenCalled();
    expect(first.stopPropagation).toHaveBeenCalled();

    const second = click();
    handlers().onClickCapture(second as never);
    expect(second.preventDefault).not.toHaveBeenCalled();
  });

  it('does not touch the click after a normal tap', () => {
    const { handlers } = setup();
    const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() };

    act(() => handlers().onPointerDown(pointer()));
    act(() => handlers().onPointerUp());
    handlers().onClickCapture(event as never);

    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('blocks the long-press context menu', () => {
    const { handlers } = setup();
    const event = { preventDefault: vi.fn() };

    handlers().onContextMenu(event as never);

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('attaches no handlers without a callback', () => {
    const { result } = renderHook(() => useLongPress(undefined));

    expect(result.current).toEqual({});
  });

  it('calls the latest callback, not the one from the first render', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result, rerender } = renderHook(({ cb }) => useLongPress(cb), {
      initialProps: { cb: first },
    });

    act(() => (result.current as Handlers).onPointerDown(pointer()));
    rerender({ cb: second });
    act(() => vi.advanceTimersByTime(500));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
  });

  it('does not fire after unmount', () => {
    const { handlers, callback, unmount } = setup();

    act(() => handlers().onPointerDown(pointer()));
    unmount();
    act(() => vi.advanceTimersByTime(1000));

    expect(callback).not.toHaveBeenCalled();
  });
});
