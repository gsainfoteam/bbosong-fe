import { useId } from 'react';

import { cn } from '@/common/utils';

const WAVE_LENGTH = 17;

const washerWater = (() => {
  let d = `M${-WAVE_LENGTH},60`;
  for (let i = 0; i < 8; i++) {
    const x = -WAVE_LENGTH + i * WAVE_LENGTH;
    d += ` Q${x + WAVE_LENGTH / 4},57 ${x + WAVE_LENGTH / 2},60 T${x + WAVE_LENGTH},60`;
  }
  return `${d} V120 H-30 Z`;
})();

/*
 * 세탁기(원) 앞에 건조기(둥근 사각)가 겹친 로고. 물 색은 흰 바탕과 16px에서 묻혀서,
 * 앱 안 '내 빨래' 기기 아이콘과 같은 진한 단계로 칠한다.
 * 두 모양 사이 틈은 흰 선을 덧그리지 않고 건조기에서 파낸다. 그래야 회색 바탕 위에서도 흰 테가 생기지 않는다.
 */
export function BrandMark({ size = 24, className }: BrandMark.Props) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');

  return (
    <svg
      width={size}
      height={size}
      viewBox="8 16 80 78"
      aria-hidden
      className={cn('block shrink-0', className)}
    >
      <defs>
        <mask id={`${id}gap`} maskUnits="userSpaceOnUse" x={0} y={0} width={100} height={100}>
          <rect width={100} height={100} fill="#fff" />
          <circle cx={39} cy={60} r={29} fill="#000" />
        </mask>
        <clipPath id={`${id}dryer`}>
          <rect x={47} y={18} width={38} height={38} rx={11} />
        </clipPath>
        <clipPath id={`${id}washer`}>
          <circle cx={39} cy={60} r={25} />
        </clipPath>
      </defs>
      <g mask={`url(#${id}gap)`}>
        <rect x={47} y={18} width={38} height={38} rx={11} fill="var(--color-orange-deep-back)" />
        <rect
          x={40}
          y={33}
          width={60}
          height={40}
          fill="var(--color-orange-deep)"
          clipPath={`url(#${id}dryer)`}
        />
      </g>
      <circle cx={39} cy={60} r={25} fill="var(--color-sky-deep-back)" />
      <path d={washerWater} fill="var(--color-sky-deep)" clipPath={`url(#${id}washer)`} />
    </svg>
  );
}

export namespace BrandMark {
  export type Props = {
    size?: number;
    className?: string;
  };
}
