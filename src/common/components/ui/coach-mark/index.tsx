import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { createPortal } from 'react-dom';

import { cn } from '@/common/utils';

import { Button } from '../button';

const TARGET_ATTRIBUTE = 'data-coach-mark';

/** 코치마크가 짚을 요소에 펼쳐 달아 주는 속성. `CoachMark`의 `target`과 같은 id를 쓴다. */
export const coachMarkTarget = (id: string) => ({ [TARGET_ATTRIBUTE]: id });

const SPOT_PADDING = 6;
const GAP = 14;
const EDGE = 16;
const MAX_WIDTH = 320;
// 말풍선 높이는 글 길이에 따라 달라, 위아래 중 어디에 둘지 가를 때만 쓰는 넉넉한 추정치다.
const ESTIMATED_HEIGHT = 190;

type Rect = { top: number; left: number; width: number; height: number; radius: number };

/** 대상 요소의 화면 위치를 따라간다. 스크롤·크기 변화·레이아웃 이동에도 맞춘다. */
function useTargetRect(target: string) {
  const [rect, setRect] = useState<Rect | null>(null);

  useLayoutEffect(() => {
    const element = document.querySelector<HTMLElement>(`[${TARGET_ATTRIBUTE}="${target}"]`);
    if (!element) return;

    element.scrollIntoView({ block: 'nearest' });

    const measure = () => {
      const { top, left, width, height } = element.getBoundingClientRect();
      const radius = parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0;
      setRect({ top, left, width, height, radius });
    };

    // 관찰을 시작하면 한 번 바로 불려서 첫 측정도 여기서 이뤄진다.
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    observer.observe(document.documentElement);
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
    };
  }, [target]);

  return rect;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * 화면의 한 요소만 남기고 나머지를 어둡게 덮은 채 말풍선으로 설명한다.
 * 대상은 `coachMarkTarget(id)`를 단 요소이며, 단계가 바뀌면 같은 인스턴스에서 구멍이 새 대상으로 옮겨간다.
 */
export function CoachMark({
  target,
  title,
  description,
  step,
  total,
  nextLabel,
  skipLabel,
  onNext,
  onSkip,
}: CoachMark.Props) {
  const rect = useTargetRect(target);
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    nextRef.current?.focus({ preventScroll: true });
  }, [target]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onSkip();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onSkip]);

  if (!rect) return null;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const spot = {
    top: rect.top - SPOT_PADDING,
    left: rect.left - SPOT_PADDING,
    width: rect.width + SPOT_PADDING * 2,
    height: rect.height + SPOT_PADDING * 2,
  };
  const spotBottom = spot.top + spot.height;

  const width = Math.min(MAX_WIDTH, viewportWidth - EDGE * 2);
  const centerX = spot.left + spot.width / 2;
  const left = clamp(centerX - width / 2, EDGE, viewportWidth - EDGE - width);
  const arrowLeft = clamp(centerX - left, 22, width - 22);

  const placement =
    viewportHeight - spotBottom - GAP >= ESTIMATED_HEIGHT
      ? 'below'
      : spot.top - GAP >= ESTIMATED_HEIGHT
        ? 'above'
        : 'bottom';

  const position =
    placement === 'below'
      ? { top: spotBottom + GAP }
      : placement === 'above'
        ? { bottom: viewportHeight - spot.top + GAP }
        : { bottom: 'max(24px, env(safe-area-inset-bottom))' };

  return createPortal(
    <>
      {/* 어두운 면 아래로 손이 닿지 않게 화면 전체를 막는다. */}
      <div aria-hidden className="fixed inset-0 z-60" />
      <div
        aria-hidden
        className={cn(
          'pointer-events-none fixed z-60 shadow-[0_0_0_100vmax_rgb(27_29_33/0.62)]',
          'ease-sheet transition-[top,left,width,height] duration-300',
        )}
        style={{ ...spot, borderRadius: rect.radius + SPOT_PADDING }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bg-surface rounded-card shadow-overlay fixed z-61 p-4"
        style={{ left, width, ...position }}
      >
        {placement !== 'bottom' && (
          <span
            aria-hidden
            className="bg-surface absolute size-3 -translate-x-1/2 rotate-45 rounded-[3px]"
            style={{ left: arrowLeft, ...(placement === 'below' ? { top: -5 } : { bottom: -5 }) }}
          />
        )}
        <h2 className="text-[16px] leading-[1.4] font-extrabold tracking-[-0.025em]">{title}</h2>
        <p className="text-ink-2 mt-1 text-[13px] leading-[1.6]">{description}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span role="img" aria-label={`${step}/${total}`} className="flex items-center gap-1.25">
            {Array.from({ length: total }, (_, index) => (
              <i
                key={index}
                className={cn(
                  'ease-sheet h-1.5 rounded-full transition-[width,background-color] duration-300',
                  index + 1 === step ? 'bg-brand w-4' : 'bg-line w-1.5',
                )}
              />
            ))}
          </span>
          <span className="flex items-center gap-1.5">
            <Button type="button" variant="text" size="s" onClick={onSkip}>
              {skipLabel}
            </Button>
            <Button ref={nextRef} type="button" size="s" onClick={onNext}>
              {nextLabel}
            </Button>
          </span>
        </div>
      </div>
    </>,
    document.body,
  );
}

export namespace CoachMark {
  export type Props = {
    /** 짚을 요소가 단 `coachMarkTarget(id)`의 id */
    target: string;
    title: string;
    description: string;
    /** 1부터 시작하는 현재 단계 */
    step: number;
    total: number;
    nextLabel: string;
    skipLabel: string;
    onNext: () => void;
    onSkip: () => void;
  };
}
