import { type ComponentProps } from 'react';

import { cn } from '@/common/utils';

import { Slot } from '../slot';

export function IconButton({
  label,
  asChild = false,
  className,
  children,
  ...props
}: IconButton.Props) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      {...(asChild ? {} : { type: 'button' as const })}
      aria-label={label}
      className={cn(
        'rounded-tile inline-grid size-11 shrink-0 place-items-center bg-transparent',
        // 회색 바탕이나 어두운 카메라 화면 위에서도 눌림이 보이도록 soft 면 대신 글자색을 옅게 깐다.
        'transition duration-120 active:scale-[0.97] active:bg-current/8',
        'focus-visible:outline-ink focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:text-ink-3 disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

export namespace IconButton {
  export type Props = {
    label: string;
    asChild?: boolean;
  } & Omit<ComponentProps<'button'>, 'aria-label'>;
}
