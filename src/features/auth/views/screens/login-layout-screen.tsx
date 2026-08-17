import { type ReactNode } from 'react';

import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';

export function LoginLayoutScreen({ className, children, ...props }: LoginLayoutScreen.Props) {
  const { t } = useTranslation();

  return (
    <div
      className={cn('mx-auto flex h-dvh w-full max-w-100 flex-col items-center', className)}
      {...props}
    >
      <div className="h-1/2 content-center">
        <span className="text-text-primary mb-10 text-4xl font-bold">{t('auth.title')}</span>
      </div>
      <div className="h-1/2 w-full px-15 text-center">{children}</div>
    </div>
  );
}

export namespace LoginLayoutScreen {
  export type Props = {
    children: ReactNode;
    className?: string;
  };
}
