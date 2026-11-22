import { cn, cv } from '@/common/utils';

import { Slot } from '../slot';

import type { VariantProps } from 'tailwind-variants';

export function Button({
  variant = 'primary',
  size = 'm',
  wide,
  float,
  asChild = false,
  loading = false,
  children,
  className,
  onClick,
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

  const busyProps = loading
    ? { 'aria-busy': true, onClick: (e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault() }
    : { onClick };

  return (
    <Comp
      className={Button.styles({ variant, size, wide, float, className })}
      {...props}
      {...busyProps}
      {...disabledProps}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && <Button.Spinner />}
          {children}
        </>
      )}
    </Comp>
  );
}

export namespace Button {
  export type Props = {
    variant?: NonNullable<VariantProps<typeof Button.styles>['variant']>;
    size?: NonNullable<VariantProps<typeof Button.styles>['size']>;
    wide?: boolean;
    float?: boolean;
    loading?: boolean;
  } & (
    | { asChild?: false }
    // asChild면 실제 요소는 자식이 정하므로 HTMLButtonElement ref를 받지 않는다. ref는 자식에 직접 단다.
    | { asChild: true; ref?: never }
  );

  export function Spinner({ className }: { className?: string }) {
    return (
      <span
        aria-hidden
        className={cn(
          'size-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent opacity-80',
          className,
        )}
      />
    );
  }

  export const styles = cv({
    base: [
      'inline-flex shrink-0 items-center justify-center gap-2 font-bold tracking-[-0.01em] whitespace-nowrap',
      'transition-[background-color,transform] duration-150 active:scale-[0.97]',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
      // 비활성은 종류와 상관없이 같은 회색으로 둔다.
      'disabled:cursor-not-allowed disabled:bg-soft disabled:text-ink-3 disabled:shadow-none disabled:active:scale-100',
      'aria-disabled:cursor-not-allowed aria-disabled:bg-soft aria-disabled:text-ink-3 aria-disabled:shadow-none',
    ],
    variants: {
      variant: {
        primary: 'bg-ink text-white active:bg-ink-pressed',
        secondary: 'bg-soft text-ink active:bg-soft-pressed',
        outline: 'bg-surface text-ink shadow-[inset_0_0_0_1px_var(--color-line)] active:bg-soft',
        danger: 'bg-danger text-white active:bg-danger-pressed',
        // 색이 들어간 면 위에서는 먹색 대신 그 면과 같은 계열의 흰 버튼을 쓴다.
        'tone-sky': 'bg-white text-sky-ink shadow-[0_0_0_1px_rgb(11_111_147/0.18)]',
        'tone-orange': 'bg-white text-orange-ink shadow-[0_0_0_1px_rgb(168_86_15/0.18)]',
        inverse: 'bg-white text-ink active:bg-[#e9eaec]',
        text: 'bg-transparent px-1 font-medium text-ink-2 disabled:bg-transparent',
      },
      size: {
        l: 'h-14 rounded-cta px-5 text-base',
        m: 'h-12 rounded-button px-4.5 text-[15px]',
        s: 'h-9 gap-1.5 rounded-chip px-3 text-[13px]',
      },
      wide: {
        true: 'w-full',
      },
      float: {
        true: 'shadow-float',
      },
    },
  });
}
