import { type CSSProperties } from 'react';

import { clamp } from 'es-toolkit';

import { cv } from '@/common/utils';
import { type MachineView } from '@/features/user/viewmodels';

import type { VariantProps } from 'tailwind-variants';

const MIN_LEVEL = 0.06;

const GLASS = 'text-ink shadow-[inset_0_0_0_1.2px_var(--color-glass-rim)]';

export function MapMarker({
  type,
  state,
  id,
  level = 0,
  mine = false,
  size = 'm',
  className,
  style,
  ...props
}: MapMarker.Props & Omit<React.ComponentProps<'span'>, keyof MapMarker.Props | 'children'>) {
  return (
    <span
      className={MapMarker.styles({ type, state, mine, size, className })}
      style={{ '--level': `${clamp(level, MIN_LEVEL, 1) * 100}%`, ...style } as CSSProperties}
      {...props}
    >
      {id}
    </span>
  );
}

export namespace MapMarker {
  export type Props = {
    type: MachineView['type'];
    state: MachineView['state'];
    id?: number;
    level?: number;
    mine?: boolean;
    size?: NonNullable<VariantProps<typeof MapMarker.styles>['size']>;
  };

  export const styles = cv({
    base: 'font-num grid shrink-0 place-items-center leading-none font-bold',
    variants: {
      type: {
        washer:
          'rounded-full [--tone:var(--color-sky-water)] [--tone-deep:var(--color-sky-deep)] [--tone-tint:var(--color-sky-tint)]',
        dryer:
          'rounded-[25%] [--tone:var(--color-orange-water)] [--tone-deep:var(--color-orange-deep)] [--tone-tint:var(--color-orange-tint)]',
      },
      state: {
        idle: 'bg-surface text-ink shadow-[inset_0_0_0_1.4px_var(--color-idle-rim)]',
        running: [
          GLASS,
          'bg-[linear-gradient(to_top,var(--water)_var(--level),var(--color-glass)_var(--level))]',
        ],
        paused: [
          GLASS,
          'bg-[linear-gradient(to_top,color-mix(in_srgb,var(--water)_55%,var(--color-glass))_var(--level),var(--color-glass)_var(--level))]',
        ],
        detecting: [GLASS, 'bg-(color:--tone-tint)'],
        elapsed: [GLASS, 'bg-[linear-gradient(to_top,var(--water),var(--color-glass)_75%)]'],
        off: 'bg-soft text-ink-3 border-off-rim border-[1.4px] border-dashed',
      } satisfies Record<MachineView['state'], unknown>,
      mine: {
        false: '[--water:var(--tone)]',
        true: '[--water:var(--tone-deep)] shadow-[0_0_0_var(--ring)_#fff,0_0_0_calc(var(--ring)*2)_var(--tone-deep)]',
      },
      size: {
        m: 'size-10 text-[15px] [--ring:2.5px]',
        s: 'size-3.5 [--ring:1.5px]',
      },
    },
  });
}
