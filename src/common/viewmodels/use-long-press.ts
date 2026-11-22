import { useCallback, useEffect, useMemo, useRef, type MouseEvent, type PointerEvent } from 'react';

const DEFAULT_DELAY_MS = 500;
/** 누른 채 이만큼(px) 넘게 움직이면 스크롤·드래그로 보고 취소한다. */
const DEFAULT_MOVE_TOLERANCE = 10;

export type LongPressHandlers = {
  onPointerDown: (event: PointerEvent) => void;
  onPointerMove: (event: PointerEvent) => void;
  onPointerUp: () => void;
  onPointerLeave: () => void;
  onPointerCancel: () => void;
  onContextMenu: (event: MouseEvent) => void;
  onClickCapture: (event: MouseEvent) => void;
};

/**
 * 길게 누르기. 요소에 펼쳐서 쓴다: `<div {...useLongPress(onLongPress)} />`
 *
 * - `delay`ms 동안 손을 떼지 않고 많이 움직이지도 않으면 `onLongPress`를 한 번 부른다.
 * - 길게 눌러 동작이 일어난 뒤에는 이어지는 click을 막아, 안쪽 버튼이 같이 눌리지 않게 한다.
 * - 모바일의 길게 누르기 메뉴(contextmenu)는 막는다.
 * - `onLongPress`가 없으면 아무 핸들러도 달지 않는다. (권한이 없을 때 등)
 */
export function useLongPress(
  onLongPress: (() => void) | undefined,
  { delay = DEFAULT_DELAY_MS, moveTolerance = DEFAULT_MOVE_TOLERANCE } = {},
): Partial<LongPressHandlers> {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const fired = useRef(false);
  // 렌더마다 새 함수가 들어와도 핸들러 참조는 바뀌지 않게 최신 콜백만 따로 들고 있는다.
  const callback = useRef(onLongPress);
  useEffect(() => {
    callback.current = onLongPress;
  });

  const cancel = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = undefined;
    origin.current = null;
  }, []);

  useEffect(() => cancel, [cancel]);

  const enabled = onLongPress !== undefined;

  return useMemo<Partial<LongPressHandlers>>(() => {
    if (!enabled) return {};

    return {
      onPointerDown: (event: PointerEvent) => {
        // 마우스는 왼쪽 버튼만 센다
        if (event.pointerType === 'mouse' && event.button !== 0) return;

        cancel();
        fired.current = false;
        origin.current = { x: event.clientX, y: event.clientY };
        timer.current = setTimeout(() => {
          fired.current = true;
          origin.current = null;
          timer.current = undefined;
          callback.current?.();
        }, delay);
      },
      onPointerMove: (event: PointerEvent) => {
        if (!origin.current) return;

        const distance = Math.hypot(
          event.clientX - origin.current.x,
          event.clientY - origin.current.y,
        );
        if (distance > moveTolerance) cancel();
      },
      onPointerUp: cancel,
      onPointerLeave: cancel,
      onPointerCancel: cancel,
      onContextMenu: (event: MouseEvent) => event.preventDefault(),
      onClickCapture: (event: MouseEvent) => {
        if (!fired.current) return;

        fired.current = false;
        event.preventDefault();
        event.stopPropagation();
      },
    };
  }, [enabled, delay, moveTolerance, cancel]);
}
