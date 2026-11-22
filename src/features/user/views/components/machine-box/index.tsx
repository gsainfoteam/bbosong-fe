import { useId, type ReactNode, type SVGProps } from 'react';

import { useTranslation } from 'react-i18next';

import { cn, formatRemainingMinutes } from '@/common/utils';

import { levelRatio } from './level-ratio';

/*
 * 기기 아이콘. 찬 높이가 곧 남은 시간이다.
 * 세탁기(원)는 물결로, 건조기(둥근 사각)는 평평하게 차오른다.
 * 모든 수치는 viewBox(한 변 66) 기준이라 칸 크기가 바뀌어도 비율이 유지된다.
 */
const VIEW = 66;
const CENTER = VIEW / 2;
/** 세탁기 원의 반지름 */
const RADIUS = 31;
/** 건조기 사각형이 가장자리에서 떨어진 거리, 한 변, 모서리 */
const INSET = 2;
const SIDE = VIEW - INSET * 2;
const CORNER = 18;

const WAVE_LENGTH = 22;
const WAVE_FRONT_AMPLITUDE = 2;
const WAVE_BACK_AMPLITUDE = 1.8;
/** 뒤 물결은 앞 물결보다 이만큼 위에서 출렁인다. */
const WAVE_BACK_RISE = 1.8;
/** 뒤 물결은 앞 물결과 어긋나도록 이만큼 밀어 둔다. */
const WAVE_BACK_SHIFT = -9;

/** 내 빨래 표식의 중심. 둥근 사각은 모서리가 비어 있어 살짝 더 바깥에 둔다. */
const MARK_POSITION = { washer: '55 11', dryer: '57 9' } as const;

/** 차오른 높이의 위쪽 y좌표 */
const levelY = (ratio: number) => INSET + SIDE * (1 - ratio);

function wavePath(y: number, amplitude: number, periods: number, closed: boolean) {
  let d = `M-${WAVE_LENGTH},${y}`;
  for (let i = 0; i < periods; i += 1) {
    const x = -WAVE_LENGTH + i * WAVE_LENGTH;
    d += ` Q${x + WAVE_LENGTH / 4},${y - amplitude} ${x + WAVE_LENGTH / 2},${y} T${x + WAVE_LENGTH},${y}`;
  }

  return closed ? `${d} V${VIEW + 14} H-${WAVE_LENGTH} Z` : d;
}

function Shape({
  type,
  ...props
}: { type: MachineBox.Type } & Omit<SVGProps<SVGCircleElement & SVGRectElement>, 'ref'>) {
  return type === 'washer' ? (
    <circle cx={CENTER} cy={CENTER} r={RADIUS} {...props} />
  ) : (
    <rect x={INSET} y={INSET} width={SIDE} height={SIDE} rx={CORNER} {...props} />
  );
}

const WATER = {
  washer: {
    front: { normal: 'fill-sky-water', mine: 'fill-sky-deep' },
    back: { normal: 'fill-sky-back', mine: 'fill-sky-deep-back' },
    tint: 'fill-sky-tint',
    color: { normal: 'var(--color-sky-water)', mine: 'var(--color-sky-deep)' },
    rimMine: 'stroke-sky-deep',
    caption: 'text-sky-ink',
  },
  dryer: {
    front: { normal: 'fill-orange-water', mine: 'fill-orange-deep' },
    back: { normal: 'fill-orange-back', mine: 'fill-orange-back' },
    tint: 'fill-orange-tint',
    color: { normal: 'var(--color-orange-water)', mine: 'var(--color-orange-deep)' },
    rimMine: 'stroke-orange-deep',
    caption: 'text-orange-ink',
  },
} as const;

/** 유리 그늘: 위쪽만 살짝 어둡게 */
function Glass({ id, type }: { id: string; type: MachineBox.Type }) {
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--color-ink)', stopOpacity: 0.06 }} />
          <stop offset="0.35" style={{ stopColor: 'var(--color-ink)', stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <Shape type={type} fill={`url(#${id})`} />
    </>
  );
}

function MineMark({ type }: { type: MachineBox.Type }) {
  return (
    <g transform={`translate(${MARK_POSITION[type]})`}>
      <circle r={8.5} className="fill-ink stroke-surface" strokeWidth={2} />
      <circle cy={-1.6} r={2} className="fill-surface" />
      <path d="M-3.6,3.8 a3.6,3.2 0 0 1 7.2,0" className="fill-surface" />
    </g>
  );
}

/** 물(열풍)이 찬 모양. 세탁기는 물결, 건조기는 평평한 면이다. */
function Fill({ type, mine, ratio }: { type: MachineBox.Type; mine: boolean; ratio: number }) {
  const water = WATER[type];
  const tone = mine ? 'mine' : 'normal';
  const y = levelY(ratio);

  if (type === 'dryer') {
    return (
      <>
        <rect x={0} y={y} width={VIEW} height={VIEW + 4} className={water.front[tone]} />
        <rect x={0} y={y} width={VIEW} height={1.2} className="fill-surface" fillOpacity={0.55} />
      </>
    );
  }

  return (
    <>
      <g transform={`translate(${WAVE_BACK_SHIFT} 0)`}>
        <path
          d={wavePath(y - WAVE_BACK_RISE, WAVE_BACK_AMPLITUDE, 7, true)}
          className={cn(water.back[tone], 'animate-wave-back motion-reduce:animate-none')}
        />
      </g>
      <path
        d={wavePath(y, WAVE_FRONT_AMPLITUDE, 6, true)}
        className={cn(water.front[tone], 'animate-wave-front motion-reduce:animate-none')}
      />
      <path
        d={wavePath(y, WAVE_FRONT_AMPLITUDE, 6, false)}
        fill="none"
        className="animate-wave-front stroke-surface motion-reduce:animate-none"
        strokeOpacity={0.55}
        strokeWidth={1}
      />
    </>
  );
}

const SHINE_STOPS = [
  [0, 0],
  [0.18, 0.08],
  [0.32, 0.3],
  [0.5, 0.7],
  [0.68, 0.3],
  [0.82, 0.08],
  [1, 0],
] as const;

/** 계산 중: 옅은 면 위로 빛이 한 번씩 지나간다. */
function Calculating({ id, type }: { id: string; type: MachineBox.Type }) {
  const water = WATER[type];

  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          {SHINE_STOPS.map(([offset, opacity]) => (
            <stop
              key={offset}
              offset={offset}
              style={{ stopColor: water.color.normal, stopOpacity: opacity }}
            />
          ))}
        </linearGradient>
      </defs>
      <rect width={VIEW} height={VIEW} className={water.tint} />
      <g className="animate-shine motion-reduce:animate-none">
        <rect
          x={-17}
          y={-30}
          width={100}
          height={126}
          fill={`url(#${id})`}
          transform={`rotate(14 ${CENTER} ${CENTER})`}
        />
      </g>
    </>
  );
}

/** 시간 모름: 남은 시간이 없어 지난 시간만 알 때, 아래에서 위로 옅어지는 면만 깐다. */
function Elapsed({ id, type, mine }: { id: string; type: MachineBox.Type; mine: boolean }) {
  const color = WATER[type].color[mine ? 'mine' : 'normal'];

  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" style={{ stopColor: color }} />
          <stop offset="0.75" style={{ stopColor: color, stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <rect width={VIEW} height={VIEW} fill={`url(#${id})`} />
    </>
  );
}

type Display =
  | { kind: 'idle' }
  | { kind: 'disabled' }
  | { kind: 'loading' }
  | { kind: 'remaining'; minutes: number }
  | { kind: 'detecting' }
  | { kind: 'elapsed'; minutes: number }
  | { kind: 'using' };

function toDisplay(machine: MachineBox.Props['machine']): Display {
  if (machine.status === 'loading') return { kind: 'loading' };
  if (machine.status === 'disabled') return { kind: 'disabled' };
  if (machine.status === 'idle') return { kind: 'idle' };

  if (machine.remainingDisplay?.kind === 'detecting') return { kind: 'detecting' };
  if (machine.remainingDisplay?.kind === 'minutes') {
    return { kind: 'remaining', minutes: machine.remainingDisplay.minutes };
  }
  if (machine.elapsedMinutes !== undefined && machine.elapsedMinutes >= 0) {
    return { kind: 'elapsed', minutes: machine.elapsedMinutes };
  }

  return { kind: 'using' };
}

function useLabels(display: Display) {
  const { t } = useTranslation('machine');

  const short = (minutes: number) => {
    const { hours, minutes: rest } = formatRemainingMinutes(minutes);
    return hours > 0
      ? t('captionHourMinute', { hours: String(hours), minutes: String(rest) })
      : t('captionMinute', { minutes: String(rest) });
  };

  switch (display.kind) {
    case 'idle':
      return { caption: t('idle'), spoken: t('idle') };
    case 'disabled':
      return { caption: t('disabled'), spoken: t('disabled') };
    case 'loading':
      return { caption: '', spoken: '' };
    case 'detecting':
      return { caption: t('remainingDetecting'), spoken: t('remainingDetecting') };
    case 'remaining': {
      const { hours, minutes } = formatRemainingMinutes(display.minutes);
      return {
        caption: short(display.minutes),
        spoken:
          hours > 0
            ? t('remainingHourMinute', { hours: String(hours), minutes: String(minutes) })
            : t('remainingMinute', { minutes: String(minutes) }),
      };
    }
    case 'elapsed': {
      const hours = Math.floor(display.minutes / 60);
      const minutes = display.minutes % 60;
      const text =
        hours > 0
          ? t('elapsedHourMinute', { hours: String(hours), minutes: String(minutes) })
          : t('elapsedMinute', { minutes: String(minutes) });
      return { caption: text, spoken: text };
    }
    case 'using':
      return { caption: t('using'), spoken: t('using') };
  }
}

export function MachineBox({ machine, className }: MachineBox.Props) {
  const { t } = useTranslation('machine');
  const id = useId();
  const display = toDisplay(machine);
  const { caption, spoken } = useLabels(display);

  const mine = machine.mine === true && display.kind !== 'idle' && display.kind !== 'disabled';
  const water = WATER[machine.type];
  const clipId = `${id}clip`;

  if (display.kind === 'loading') {
    return (
      <div role="status" aria-busy className={cn('flex w-full flex-col items-center', className)}>
        <svg viewBox={`0 0 ${VIEW} ${VIEW}`} aria-hidden className="block aspect-square w-full">
          <g className="animate-blink motion-reduce:animate-none">
            <Shape type={machine.type} className="fill-icon-skeleton" />
          </g>
        </svg>
        <span className="bg-icon-skeleton animate-blink mt-2.25 block h-3.25 w-9.5 rounded-md motion-reduce:animate-none" />
      </div>
    );
  }

  const running = display.kind !== 'idle' && display.kind !== 'disabled';

  const ring = (() => {
    if (display.kind === 'idle') return { className: 'stroke-icon-rim-empty', width: 1.6 };
    if (display.kind === 'disabled') return { className: 'stroke-icon-rim-off', width: 1.4 };
    if (mine) return { className: water.rimMine, width: 2.6 };
    return { className: 'stroke-icon-rim', width: 1.4 };
  })();

  const surface = cn(
    display.kind === 'idle' && 'fill-surface',
    display.kind === 'disabled' && 'fill-soft',
    running && 'fill-icon-base',
  );

  let content: ReactNode = null;
  if (display.kind === 'remaining') {
    content = (
      <Fill
        type={machine.type}
        mine={mine}
        ratio={levelRatio(display.minutes, machine.elapsedMinutes)}
      />
    );
  } else if (display.kind === 'detecting') {
    content = <Calculating id={`${id}shine`} type={machine.type} />;
  } else if (display.kind === 'elapsed') {
    content = <Elapsed id={`${id}elapsed`} type={machine.type} mine={mine} />;
  }

  const label = [t(machine.type), t('count', { id: String(machine.id) }), mine && t('mine'), spoken]
    .filter(Boolean)
    .join(', ');

  return (
    <div
      role="img"
      aria-label={label}
      className={cn('flex w-full flex-col items-center', className)}
    >
      <svg viewBox={`0 0 ${VIEW} ${VIEW}`} aria-hidden className="block aspect-square w-full">
        <defs>
          <clipPath id={clipId}>
            <Shape type={machine.type} />
          </clipPath>
        </defs>

        <Shape type={machine.type} className={surface} />
        {content && <g clipPath={`url(#${clipId})`}>{content}</g>}
        {running && <Glass id={`${id}glass`} type={machine.type} />}
        <Shape
          type={machine.type}
          fill="none"
          className={ring.className}
          strokeWidth={ring.width}
          strokeDasharray={display.kind === 'disabled' ? '3.2 3.6' : undefined}
        />
        <text
          x={CENTER}
          y={33.5}
          fontSize={21}
          fontWeight={700}
          textAnchor="middle"
          dominantBaseline="central"
          className={display.kind === 'disabled' ? 'fill-ink3' : 'fill-ink'}
        >
          {machine.id}
        </text>
        {mine && <MineMark type={machine.type} />}
      </svg>

      <b
        aria-hidden
        className={cn(
          'text-label mt-2.25 leading-none whitespace-nowrap',
          display.kind === 'idle' && water.caption,
          display.kind !== 'idle' && display.kind !== 'remaining' && 'text-ink2 font-medium',
        )}
      >
        {caption}
      </b>
    </div>
  );
}

export namespace MachineBox {
  export type Type = 'washer' | 'dryer';

  /** loading은 목록을 불러오는 동안 같은 자리에 깜빡이는 모양만 보여 준다. */
  export type Status = 'idle' | 'using' | 'disabled' | 'loading';

  export type RemainingDisplay = { kind: 'minutes'; minutes: number } | { kind: 'detecting' };

  export type Props = {
    machine: {
      type: Type;
      id: number;
      status: Status;
      /** 지난 시간. 남은 시간이 있으면 전체 시간(지난 + 남은)을 추정해 찬 높이를 정한다. */
      elapsedMinutes?: number;
      remainingDisplay?: RemainingDisplay;
      /** 내가 등록한 기기 */
      mine?: boolean;
    };
    className?: string;
  };
}
