import type { ReactNode } from 'react';

// import { useTranslation } from 'react-i18next';

import { Link } from '@tanstack/react-router';

import { NavBar } from '@/common/components';
import { cn } from '@/common/utils';


// import type { LayoutCard } from '../layout-card';

export function Layout({ className, children }: Layout.Props) {
  // const { t } = useTranslation('common');

  return (
    <div className={cn('bg-bg-surface h-dvh px-5', className)}>
      <div className=" text-white mx-auto flex h-full min-h-0 w-full max-w-100 flex-col gap-5 bg-bg">
        <NavBar className={'border-b border-b-white mx-10'} />
        {children}
        {/* temporal */}
        <Link to={'/'} className='border border-white text-center'>to index</Link>
      </div>
    </div>
  );
}

export namespace Layout {
  export type Props = {
    className?: string;
    // onMenuOpen?: () => void;
    children: ReactNode;
  };
}
