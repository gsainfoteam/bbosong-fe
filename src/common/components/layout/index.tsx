import type { ReactNode } from 'react';

// import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';

// import type { LayoutCard } from '../layout-card';

export function Layout({ className, children }: Layout.Props) {
  // const { t } = useTranslation('common');

  return (
    <div className={cn('bg-bg-surface h-dvh px-5 py-6', className)}>
      <div className="mx-auto flex h-full min-h-0 w-full max-w-100 flex-col gap-5">
        {children}
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
