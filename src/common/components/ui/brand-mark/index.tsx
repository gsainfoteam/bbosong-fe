import { useId } from 'react';

import { cn } from '@/common/utils';

const BODY = 'M38,22 L62,22 L78,28 L88,44 L76,50 L72,46 L72,80 L28,80 L28,46 L24,50 L12,44 L22,28 Z';
const BACK = 'M30,17 L38,17 Q50,20.5 62,17 L70,17 V40 H30 Z';
const NECK = { cx: 50, cy: 15, r: 12 };

// 목은 흰 원을 덧그리지 않고 몸판에서 파낸다. 그래야 회색 바탕 위에서도 목 둘레에 흰 테가 생기지 않는다.
export function BrandMark({ size = 24, className }: BrandMark.Props) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');

  return (
    <svg
      width={size}
      height={size}
      viewBox="2.5 3.5 95 95"
      aria-hidden
      className={cn('block shrink-0', className)}
    >
      <defs>
        <mask id={`${id}neck`} maskUnits="userSpaceOnUse" x={0} y={0} width={100} height={100}>
          <rect width={100} height={100} fill="#fff" />
          <circle {...NECK} fill="#000" />
        </mask>
        <clipPath id={`${id}collar`}>
          <circle {...NECK} />
        </clipPath>
      </defs>
      <path
        d={BODY}
        fill="var(--color-brand)"
        stroke="var(--color-brand)"
        strokeWidth={10}
        strokeLinejoin="round"
        mask={`url(#${id}neck)`}
      />
      <path d={BACK} fill="var(--color-brand-deep)" clipPath={`url(#${id}collar)`} />
    </svg>
  );
}

export namespace BrandMark {
  export type Props = {
    size?: number;
    className?: string;
  };
}
