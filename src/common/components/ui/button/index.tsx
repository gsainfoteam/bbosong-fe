import React from 'react';

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
}: Button.Props & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      className={Button.styles({
        variant: props.disabled ? 'disabled' : variant,
        size,
        className,
      })}
      {...props}
    >
      {children}
    </Comp>
  );
}

export namespace Button {
  export type Props = {
    variant?: NonNullable<VariantProps<typeof Button.styles>['variant']>;
    size?: NonNullable<VariantProps<typeof Button.styles>['size']>;
    asChild?: boolean;
  };

  export const styles = cv({
    base: ['flex items-center justify-center rounded-lg'],
    variants: {
      variant: {
        default: ['bg-bg-surface w-full text-lg text-text-primary', 'transition-all duration-150'],
        disabled: [],
      },
      size: {
        default: 'p-2',
      },
    },
  });
}
