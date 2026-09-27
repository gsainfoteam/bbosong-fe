import { useId } from 'react';

import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';

/*
 * 모든 수치는 viewBox(한 변 100) 기준이다. 디자인 시안의 박스 한 변(≈94px)을 100으로 환산했고,
 * 박스 크기가 바뀌어도 글자·선·여백의 비율이 그대로 유지된다.
 */
const SIZE = 100;
const CENTER = SIZE / 2;

/** 안쪽 흰 선 */
const LINE_WIDTH = 0.6;
/** 세탁기 안쪽 원의 반지름 */
const RING_RADIUS = 37.5;
/** 건조기 안쪽 사각형이 가장자리에서 떨어진 거리 */
const FRAME_INSET = 10.5;

/** 디자인 12px */
const LABEL_FONT_SIZE = 12.8;
/** 디자인 43px */
const NUMBER_FONT_SIZE = 46.5;
/** Pretendard 숫자 높이(0.71em)의 절반. 숫자가 세로 가운데에 오도록 기준선을 이만큼 내린다. */
const DIGIT_HALF_HEIGHT = 0.355;
/** 아래 라벨은 선보다 살짝 안쪽에 놓인다. */
const BOTTOM_LABEL_SHIFT = 1.2;
/** 라벨 글자와 끊긴 선 끝 사이의 여백 */
const LABEL_GAP = 3.8;
/** 세탁기 원은 라벨이 짧아도 이 각도만큼은 선을 비워 둔다. */
const RING_MIN_GAP_DEG = { top: 138, bottom: 79.5 };

const round = (value: number) => Math.round(value * 1000) / 1000;

/** 각도는 시계 방향 기준(0° = 오른쪽, 90° = 아래) */
function pointOnCircle(radius: number, deg: number) {
  const rad = (deg * Math.PI) / 180;

  return `${round(CENTER + radius * Math.cos(rad))} ${round(CENTER + radius * Math.sin(rad))}`;
}

function arc(radius: number, fromDeg: number, toDeg: number, clockwise = true) {
  const sweep = clockwise ? 1 : 0;

  return `M ${pointOnCircle(radius, fromDeg)} A ${radius} ${radius} 0 0 ${sweep} ${pointOnCircle(radius, toDeg)}`;
}

function ringGap(centerDeg: number, spanDeg: number) {
  return arc(RING_RADIUS, centerDeg - spanDeg / 2, centerDeg + spanDeg / 2);
}

function horizontalLine(y: number) {
  return `M 0 ${y} H ${SIZE}`;
}

const SHAPE: Record<
  MachineBox.Type,
  {
    rounded: boolean;
    frameInset: number;
    /** 원 둘레를 따라 놓인 라벨은 디자인상 자간이 더 넓다. */
    labelSpacing: number;
    /** 라벨이 따라가는 경로. 글자가 바로 서도록 둘 다 왼쪽 → 오른쪽으로 진행한다. */
    labelPath: { top: string; bottom: string };
    minGap?: { top: string; bottom: string };
  }
> = {
  washer: {
    rounded: true,
    frameInset: CENTER - RING_RADIUS,
    labelSpacing: 0.75,
    labelPath: {
      top: arc(RING_RADIUS, 180, 360),
      bottom: arc(RING_RADIUS - BOTTOM_LABEL_SHIFT, 180, 0, false),
    },
    minGap: {
      top: ringGap(270, RING_MIN_GAP_DEG.top),
      bottom: ringGap(90, RING_MIN_GAP_DEG.bottom),
    },
  },
  dryer: {
    rounded: false,
    frameInset: FRAME_INSET,
    labelSpacing: 0.25,
    labelPath: {
      top: horizontalLine(FRAME_INSET),
      bottom: horizontalLine(SIZE - FRAME_INSET - BOTTOM_LABEL_SHIFT),
    },
  },
};

const SURFACE: Record<MachineBox.Type, Record<MachineBox.Status, string>> = {
  washer: {
    idle: 'fill-washer',
    using: 'fill-disabled',
    disabled: 'fill-disabled',
  },
  dryer: {
    idle: 'fill-dryer',
    using: 'fill-disabled',
    disabled: 'fill-disabled',
  },
};

function useElapsedLabel(elapsedMinutes?: number) {
  const { t } = useTranslation('machine');

  if (elapsedMinutes === undefined || elapsedMinutes < 0) return '';

  const hours = Math.floor(elapsedMinutes / 60);
  const minutes = elapsedMinutes % 60;

  return hours > 0
    ? t('elapsedHourMinute', { hours: String(hours), minutes: String(minutes) })
    : t('elapsedMinute', { minutes: String(minutes) });
}

function Label({
  pathId,
  spacing,
  children,
}: {
  pathId: string;
  spacing: number;
  children: string;
}) {
  return (
    <text
      fontSize={LABEL_FONT_SIZE}
      letterSpacing={spacing}
      textAnchor="middle"
      dominantBaseline="central"
    >
      <textPath href={`#${pathId}`} startOffset="50%">
        {children}
      </textPath>
    </text>
  );
}

export function MachineBox({ machine, className, ...props }: MachineBox.Props) {
  const { t } = useTranslation('machine');
  const id = useId();
  const elapsedLabel = useElapsedLabel(
    machine.status === 'using' ? machine.elapsedMinutes : undefined,
  );

  // t('idle')
  // t('using')
  // t('disabled')
  const statusLabel = t(machine.status);

  const shape = SHAPE[machine.type];
  const inset = shape.frameInset;
  const maskId = `${id}mask`;
  const pathId = { top: `${id}top`, bottom: `${id}bottom` };

  const labels = (
    <>
      {elapsedLabel && (
        <Label pathId={pathId.top} spacing={shape.labelSpacing}>
          {elapsedLabel}
        </Label>
      )}
      <Label pathId={pathId.bottom} spacing={shape.labelSpacing}>
        {statusLabel}
      </Label>
    </>
  );

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={[t(machine.type), machine.id, statusLabel, elapsedLabel]
        .filter(Boolean)
        .join(' ')}
      className={cn('block aspect-square w-full font-light', className)}
      {...props}
    >
      <defs>
        <path id={pathId.top} d={shape.labelPath.top} />
        <path id={pathId.bottom} d={shape.labelPath.bottom} />

        {/* 흰 선에서 라벨이 놓이는 자리를 지운다. */}
        <mask id={maskId} maskUnits="userSpaceOnUse" x={0} y={0} width={SIZE} height={SIZE}>
          <rect width={SIZE} height={SIZE} fill="white" />
          <g fill="none" stroke="black" strokeWidth={LABEL_GAP * 2} strokeLinejoin="round">
            {elapsedLabel && shape.minGap && <path d={shape.minGap.top} />}
            {shape.minGap && <path d={shape.minGap.bottom} />}
            <g fill="black">{labels}</g>
          </g>
        </mask>
      </defs>

      <rect
        width={SIZE}
        height={SIZE}
        rx={shape.rounded ? CENTER : 0}
        className={SURFACE[machine.type][machine.status]}
      />
      <rect
        x={inset}
        y={inset}
        width={SIZE - inset * 2}
        height={SIZE - inset * 2}
        rx={shape.rounded ? CENTER - inset : 0}
        fill="none"
        strokeWidth={LINE_WIDTH}
        mask={`url(#${maskId})`}
        className="stroke-white"
      />

      <g className="fill-text-primary">
        {labels}
        <text
          x={CENTER}
          y={CENTER + NUMBER_FONT_SIZE * DIGIT_HALF_HEIGHT}
          fontSize={NUMBER_FONT_SIZE}
          textAnchor="middle"
        >
          {machine.id}
        </text>
      </g>
    </svg>
  );
}

export namespace MachineBox {
  export type Type = 'washer' | 'dryer';

  export type Status = 'idle' | 'using' | 'disabled';

  export type Props = {
    machine: { type: Type; id: number; status: Status; elapsedMinutes?: number };
    className?: string;
  };
}
