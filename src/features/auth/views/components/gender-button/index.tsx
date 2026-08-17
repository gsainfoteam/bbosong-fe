import type { ReactNode } from 'react';

import { Button } from '@/common/components/ui/button';
import { cn } from '@/common/utils';

export function GenderButton({
  children,
  selected,
  disabled = false,
  onClick,
  className,
  ...props
}: GenderButton.Props) {
  return (
    <Button
      className={cn(
        selected ? 'bg-bg text-white' : 'bg-bg-surface text-text-primary',
        className,
      )}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </Button>
  );
}

export namespace GenderButton {
  export type Props = {
    children: ReactNode;
    selected: boolean;
    disabled?: boolean;
    onClick: () => void;
    className?: string;
  };
}
