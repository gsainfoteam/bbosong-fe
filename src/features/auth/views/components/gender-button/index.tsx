import type { ReactNode } from 'react';

import { cn } from '@/common/utils';

export function GenderButton({
  children,
  selected,
  onClick,
  className,
  ...props
}: GenderButton.Props) {
  return (
    <button
      className={cn(
        'w-full rounded-lg py-2 text-sm transition-all duration-150',
        selected ? 'bg-bg text-white' : 'bg-bg-surface',
        className,
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export namespace GenderButton {
  export type Props = {
    children: ReactNode;
    selected: boolean;
    onClick: () => void;
    className?: string;
  };
}
