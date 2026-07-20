import type { ReactNode } from 'react';

import { NavBar } from '@/common/components';
import { cn } from '@/common/utils';

export function Layout({ className, children }: Layout.Props) {
  return (
    <div className={cn('bg-bg-surface h-dvh px-5', className)}>
      <div className=" text-white mx-auto flex h-full min-h-0 w-full max-w-100 flex-col gap-5 bg-bg">
        <NavBar className={'border-b border-b-white mx-10'} />
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
