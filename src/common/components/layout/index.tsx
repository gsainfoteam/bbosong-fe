import type { ReactNode } from 'react';

// import { NavBar } from '@/common/components';
import { cn } from '@/common/utils';

export function Layout({ className, children }: Layout.Props) {
  return (
    <div
      className={cn(className, 'bg-bg text-text-primary mx-auto h-dvh min-h-0 w-full max-w-120')}
    >
      {/*<NavBar className={'border-b border-b-white'} />*/}
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
