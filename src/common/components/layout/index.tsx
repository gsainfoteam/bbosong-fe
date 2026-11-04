import type { ReactNode } from 'react';

import { cn } from '@/common/utils';

export function Layout({ className, children }: Layout.Props) {
  return (
    <div
      className={cn(
        className,
        'bg-bg text-text-primary mx-auto flex min-h-dvh w-full max-w-120 flex-col',
      )}
    >
      {children}
    </div>
  );
}

export namespace Layout {
  export type Props = {
    className?: string;
    children: ReactNode;
  };
}
