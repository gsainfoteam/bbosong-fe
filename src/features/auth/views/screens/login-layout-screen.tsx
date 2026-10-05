import { type ReactNode } from 'react';

import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';

export function LoginLayoutScreen({ className, children, ...props }: LoginLayoutScreen.Props) {
  const { t } = useTranslation('auth');

  return (
    <div
      className={cn('bg-bg mx-auto flex h-dvh w-full max-w-100 flex-col items-center', className)}
      {...props}
    >
      <div className="text-text-primary flex h-1/2 flex-col items-center justify-center gap-4">
        <span className="text-3xl font-medium text-center">{t('description')}</span>
        <span className="text-4xl font-semibold">{t('bbosong')}</span>
      </div>
      <div className="flex h-1/2 w-full items-center justify-center">{children}</div>
    </div>
  );
}

export namespace LoginLayoutScreen {
  export type Props = {
    children: ReactNode;
    className?: string;
  };
}
