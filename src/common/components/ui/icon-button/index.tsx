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
        'text-ink rounded-tile inline-grid size-11 shrink-0 cursor-pointer place-items-center bg-transparent',
        // 눌림은 바탕과 상관없이 보이도록 먹색을 옅게 깐다. (회색 바탕 위에서 soft 면은 구분되지 않는다)
        'active:bg-ink/8 transition duration-120 active:scale-[0.97]',
        'focus-visible:outline-ink focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:text-ink3 disabled:cursor-not-allowed',
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
    /** 아이콘만 있는 버튼이라 접근성 라벨이 필수다. */
    label: string;
    /** true면 자식(예: Link)이 버튼 모양을 입는다. */
    asChild?: boolean;
  } & Omit<ComponentProps<'button'>, 'aria-label'>;
}
