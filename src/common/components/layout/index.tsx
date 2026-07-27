import type { ReactNode } from 'react';

import { NavBar } from '@/common/components';
import { cn } from '@/common/utils';

export function Layout({ className, children }: Layout.Props) {
  return (
    <div className={cn('bg-bg-surface h-dvh px-5', className)}>
      <div className="bg-bg mx-auto flex h-full min-h-0 w-full max-w-100 flex-col gap-5 text-white">
        <NavBar className={'mx-10 border-b border-b-white'} />
        {children}
      </div>
    </div>
  );
}

export namespace Layout {
  export type Props = {
    className?: string;
    children: ReactNode;
  };
}
