import type { ReactNode } from 'react';

import { Button } from '@/common/components/ui/button';
import { cn } from '@/common/utils';

export function GenderButton({
  children,
  disabled = false,
  onClick,
  className,
  ...props
}: GenderButton.Props) {
  return (
    <Button
      className={cn(className, 'aspect-square')}
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
    disabled?: boolean;
    onClick: () => void;
    className?: string;
  };
}
