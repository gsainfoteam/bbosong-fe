import { useId } from 'react';

import { cn } from '@/common/utils';

// viewBox 66 하나로 그리고 크기만 바꾼다. 선 굵기와 번호 크기가 칸 크기에 맞춰 함께 줄어든다.
const SIZE = 66;
const MIN_LEVEL = 0.06;
// 물결 한 주기. styles.css 의 wave 키프레임 이동 거리와 같아야 반복이 이어 붙는다.
const WAVE_LENGTH = 22;

const TONE = {
  washer: {
    water: 'var(--color-sky-water)',
    back: 'var(--color-sky-back)',
    deep: 'var(--color-sky-deep)',
    deepBack: 'var(--color-sky-deep-back)',
    tint: 'var(--color-sky-tint)',
  },
  dryer: {
    water: 'var(--color-orange-water)',
    back: 'var(--color-orange-back)',
    deep: 'var(--color-orange-deep)',
    deepBack: 'var(--color-orange-deep-back)',
    tint: 'var(--color-orange-tint)',
  },
} as const;

// 빛 띠의 가장자리가 보이면 인위적이라, 넓은 폭에 걸쳐 종 모양으로 옅어지게 한다.
const SHINE_STOPS = [
  [0, 0],
  [0.18, 0.08],
  [0.32, 0.3],
  [0.5, 0.7],
  [0.68, 0.3],
  [0.82, 0.08],
  [1, 0],
] as const;

function waveCurve(y: number, amp: number, count: number) {
  let d = `M-${WAVE_LENGTH},${y}`;
  for (let i = -1; i < count; i++) {
    const x = i * WAVE_LENGTH;
    d += ` Q${x + WAVE_LENGTH / 4},${y - amp} ${x + WAVE_LENGTH / 2},${y} T${x + WAVE_LENGTH},${y}`;
  }
  return d;
}

const waveFill = (y: number, amp: number, count: number) =>
  `${waveCurve(y, amp, count)} V80 H-${WAVE_LENGTH} Z`;

type Tone = (typeof TONE)[MachineVessel.Type];

type Look = {
  fill: string;
  rim?: { color: string; width: number; dash?: string };
  number?: string;
  shade: boolean;
  className?: string;
};

const GLASS: Look = {
  fill: 'var(--color-glass)',
  rim: { color: 'var(--color-glass-rim)', width: 1.4 },
  number: 'var(--color-ink)',
  shade: true,
};

// 상태별 칸의 겉모습. 안에 차는 내용은 StateContent가 같은 순서로 정한다.
const LOOK = {
  idle: {
    fill: 'var(--color-surface)',
    rim: { color: 'var(--color-idle-rim)', width: 1.6 },
    number: 'var(--color-ink)',
    shade: true,
  },
  running: GLASS,
  paused: GLASS,
  detecting: GLASS,
  elapsed: GLASS,
  off: {
    fill: 'var(--color-soft)',
    rim: { color: 'var(--color-off-rim)', width: 1.4, dash: '3.2 3.6' },
    number: 'var(--color-ink-3)',
    shade: false,
  },
  loading: { fill: 'var(--color-skeleton)', shade: false, className: 'motion-safe:animate-pulse' },
} satisfies Record<MachineVessel.State, Look>;

function StateContent({ state, ...level }: { state: MachineVessel.State } & Level.Props) {
  switch (state) {
    case 'idle':
      return null;
    case 'running':
      return <Level {...level} animate />;
    case 'paused':
      return (
        <g opacity={0.55}>
          <Level {...level} />
        </g>
      );
    case 'detecting':
      return <Shine tone={level.tone} />;
    case 'elapsed':
      return <Fade tone={level.tone} />;
    case 'off':
    case 'loading':
      return null;
  }
}

function Level({ round, tone, level, mine, animate = false }: Level.Props & { animate?: boolean }) {
  const y = 64 - 62 * Math.max(Math.min(level, 1), MIN_LEVEL);
  const front = mine ? tone.deep : tone.water;
  const back = mine ? tone.deepBack : tone.back;

  // 건조기는 물이 아니라 열풍이라 출렁이지 않고 평평하게 찬다.
  if (!round) {
    return (
      <>
        <rect x={0} y={y} width={SIZE} height={70} fill={front} />
        <rect x={0} y={y} width={SIZE} height={1.2} fill="#fff" fillOpacity={0.55} />
      </>
    );
  }

  return (
    <>
      <g transform="translate(-9 0)">
        <path
          d={waveFill(y - 1.8, 1.8, 6)}
          fill={back}
          className={cn(animate && 'motion-safe:animate-wave-back')}
        />
      </g>
      <path
        d={waveFill(y, 2, 5)}
        fill={front}
        className={cn(animate && 'motion-safe:animate-wave')}
      />
      <path
        d={waveCurve(y, 2, 5)}
        fill="none"
        stroke="#fff"
        strokeOpacity={0.55}
        strokeWidth={1}
        className={cn(animate && 'motion-safe:animate-wave')}
      />
    </>
  );
}

namespace Level {
  export type Props = { round: boolean; tone: Tone; level: number; mine: boolean };
}

// 남은 시간을 계산하는 동안은 옅은 물빛 위로 빛 한 줄기만 지나간다.
function Shine({ tone }: { tone: Tone }) {
  const id = `${useId().replace(/[^a-zA-Z0-9_-]/g, '')}shine`;
  return (
    <>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
        {SHINE_STOPS.map(([offset, opacity]) => (
          <stop key={offset} offset={offset} stopColor={tone.water} stopOpacity={opacity} />
        ))}
      </linearGradient>
      <rect width={SIZE} height={SIZE} fill={tone.tint} />
      <g className="motion-safe:animate-shine">
        <rect
          x={-17}
          y={-30}
          width={100}
          height={126}
          fill={`url(#${id})`}
          transform="rotate(14 33 33)"
        />
      </g>
    </>
  );
}

// 남은 시간을 모르면 수면 없이 아래에서 흐려지는 물로만 보여 준다.
function Fade({ tone }: { tone: Tone }) {
  const id = `${useId().replace(/[^a-zA-Z0-9_-]/g, '')}fade`;
  return (
    <>
      <linearGradient id={id} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor={tone.water} />
        <stop offset="0.75" stopColor={tone.water} stopOpacity={0} />
      </linearGradient>
      <rect width={SIZE} height={SIZE} fill={`url(#${id})`} />
    </>
  );
}

export function MachineVessel({
  type,
  id,
  state,
  level = 0,
  mine = false,
  badge = true,
  size = SIZE,
  className,
}: MachineVessel.Props) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const round = type === 'washer';
  const tone = TONE[type];
  const look: Look = LOOK[state];
  const rim = look.rim && (mine ? { ...look.rim, color: tone.deep, width: 2.6 } : look.rim);

  const shape = (props: React.SVGProps<SVGCircleElement & SVGRectElement>) =>
    round ? (
      <circle cx={33} cy={33} r={31} {...props} />
    ) : (
      <rect x={2} y={2} width={62} height={62} rx={18} {...props} />
    );

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width={size}
      height={size}
      aria-hidden
      className={cn('block overflow-visible', look.className, className)}
    >
      <defs>
        <clipPath id={`${uid}clip`}>{shape({})}</clipPath>
        <linearGradient id={`${uid}shade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-ink)" stopOpacity={0.06} />
          <stop offset="0.35" stopColor="var(--color-ink)" stopOpacity={0} />
        </linearGradient>
      </defs>

      {shape({ fill: look.fill })}
      <g clipPath={`url(#${uid}clip)`}>
        <StateContent state={state} round={round} tone={tone} level={level} mine={mine} />
      </g>
      {look.shade && shape({ fill: `url(#${uid}shade)` })}
      {rim &&
        shape({
          fill: 'none',
          stroke: rim.color,
          strokeWidth: rim.width,
          strokeDasharray: rim.dash,
        })}

      {look.number && (
        <text
          x={33}
          y={33.5}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={21}
          fontWeight={700}
          fill={look.number}
          className="font-num"
        >
          {id}
        </text>
      )}

      {/* 번호를 그리지 않는 로딩 칸은 아직 어느 기기인지 모르므로 내 것 표식도 달지 않는다. */}
      {mine && badge && look.number && (
        <g transform={round ? 'translate(55 11)' : 'translate(57 9)'}>
          <circle r={8.5} fill="var(--color-ink)" stroke="#fff" strokeWidth={2} />
          <circle cy={-1.6} r={2} fill="#fff" />
          <path d="M-3.6,3.8 a3.6,3.2 0 0 1 7.2,0" fill="#fff" />
        </g>
      )}
    </svg>
  );
}

export namespace MachineVessel {
  export type Type = 'washer' | 'dryer';

  export type State = 'idle' | 'running' | 'paused' | 'detecting' | 'elapsed' | 'off' | 'loading';

  export type Props = {
    type: Type;
    id: number;
    state: State;
    /** 0–1. 남은 시간 ÷ 전체 시간 */
    level?: number;
    mine?: boolean;
    /** 내 빨래 카드처럼 내 것임이 자명한 자리에서는 사람 표식을 뺀다 */
    badge?: boolean;
    size?: number;
    className?: string;
  };
}
