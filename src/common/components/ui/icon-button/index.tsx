import { type ComponentProps } from 'react';

import { cn } from '@/common/utils';

export function IconButton({ label, className, children, ...props }: IconButton.Props) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'text-ink rounded-tile inline-grid size-11 shrink-0 cursor-pointer place-items-center bg-transparent',
        'active:bg-soft transition duration-120 active:scale-[0.97]',
        'focus-visible:outline-ink focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:text-ink3 disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export namespace IconButton {
  export type Props = {
    /** 아이콘만 있는 버튼이라 접근성 라벨이 필수다. */
    label: string;
  } & Omit<ComponentProps<'button'>, 'aria-label'>;
}
