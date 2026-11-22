import { cn, cv } from '@/common/utils';

import { Slot } from '../slot';

import type { VariantProps } from 'tailwind-variants';

export function Button({
  variant = 'primary',
  size = 'm',
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

  // 처리 중에는 색을 그대로 두고 글자만 바꾸되, 중복 제출은 막는다.
  const busyProps = loading
    ? {
        'aria-busy': true,
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault(),
      }
    : { onClick };

  return (
    <Comp
      className={Button.styles({ variant, size, className })}
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
    /** 주 버튼은 화면당 하나, 보조/외곽선은 부가 동작, 위험은 되돌릴 수 없을 때만 쓴다. */
    variant?: NonNullable<VariantProps<typeof Button.styles>['variant']>;
    /** l 56 · m 48 · s 36 */
    size?: NonNullable<VariantProps<typeof Button.styles>['size']>;
    /** 처리 중. 폭은 그대로 두고 스피너와 글자만 바뀌도록 children을 바꿔 넘긴다. */
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

  const disabledStyle = [
    'disabled:bg-soft disabled:text-ink3 disabled:ring-0 disabled:inset-ring-0 disabled:cursor-not-allowed',
    'aria-disabled:bg-soft aria-disabled:text-ink3 aria-disabled:ring-0 aria-disabled:inset-ring-0 aria-disabled:cursor-not-allowed',
  ];

  export const styles = cv({
    base: [
      'inline-flex cursor-pointer items-center justify-center whitespace-nowrap select-none',
      'transition duration-120 active:scale-[0.97]',
      'focus-visible:outline-ink focus-visible:outline-2 focus-visible:outline-offset-2',
      ...disabledStyle,
    ],
    variants: {
      variant: {
        primary: 'bg-ink active:bg-ink-pressed text-white',
        secondary: 'bg-soft text-ink active:bg-soft-pressed',
        outline: 'bg-surface text-ink inset-ring-line active:bg-soft inset-ring-1',
        danger: 'bg-danger active:bg-danger-pressed text-white',
        // 색 있는 면(배너) 위에서는 같은 계열의 흰 버튼을 쓴다.
        'tone-washer': 'bg-surface text-sky-ink ring-sky-ink/18 ring-1',
        'tone-dryer': 'bg-surface text-orange-ink ring-orange-ink/18 ring-1',
        text: 'text-ink2 bg-transparent font-medium',
        'text-danger': 'text-danger bg-transparent',
      },
      size: {
        l: 'rounded-button-lg text-button-lg h-14 gap-2 px-4.5',
        m: 'rounded-button text-body-strong h-12 gap-2 px-4.5',
        s: 'rounded-chip text-label h-9 gap-1.5 px-3',
      },
    },
    compoundVariants: [
      {
        variant: ['text', 'text-danger'],
        class: 'px-1 disabled:bg-transparent aria-disabled:bg-transparent',
      },
    ],
  });
}
