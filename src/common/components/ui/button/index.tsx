import { cv } from '@/common/utils';

import { Slot } from '../slot';

import type { VariantProps } from 'tailwind-variants';

export function Button({
  variant = 'default',
  size = 'default',
  asChild = false,
  children,
  className,
  ...props
}: Button.Props & React.ComponentProps<'button'>) {
  const Comp = asChild ? Slot : 'button';

  // asChild와 disabled 속성이 동시 활성화될 때 비버튼 자식 엘리먼트의 진입 차단 및 aria 속성 대행 주입
  const disabledProps =
    asChild && props.disabled
      ? {
          'aria-disabled': true,
          tabIndex: -1,
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
          },
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
            }
          },
          style: { pointerEvents: 'none' as const, ...props.style },
        }
      : {};

  return (
    <Comp className={Button.styles({ variant, size, className })} {...props} {...disabledProps}>
      {children}
    </Comp>
  );
}

export namespace Button {
  export type Props = {
    variant?: NonNullable<VariantProps<typeof Button.styles>['variant']>;
    size?: NonNullable<VariantProps<typeof Button.styles>['size']>;
  } & (
    | { asChild?: false }
    // asChild면 실제 요소는 자식이 정하므로 HTMLButtonElement ref를 받지 않는다. ref는 자식에 직접 단다.
    | { asChild: true; ref?: never }
  );

  export const styles = cv({
    base: [
      'flex items-center justify-center rounded-md',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
    ],
    variants: {
      variant: {
        default: [
          'w-full text-heading text-text-primary border border-border',
          'transition-all duration-150',
        ],
        minimum: ['text-text-primary border border-border', 'transition-all duration-150'],
      },
      size: {
        default: 'p-2',
        minimum: 'p-2',
      },
    },
  });
}
