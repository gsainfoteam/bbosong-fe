import { type ReactNode } from 'react';

import { useTranslation } from 'react-i18next';

import { isNativeApp } from '@/common/lib';
import { cn } from '@/common/utils';

export function LoginLayoutScreen({ className, children, ...props }: LoginLayoutScreen.Props) {
  const { t } = useTranslation('auth');

  return (
    <div
      className={cn('bg-bg mx-auto flex h-dvh w-full max-w-100 flex-col items-center', className)}
      {...props}
    >
      <div className="text-text-primary flex h-1/2 flex-col items-center justify-center gap-4">
        {/* 네이티브 앱에서는 "웹 서비스"가 아니므로 웹 표기를 뺀 문구를 쓴다 */}
        <span className="text-center text-3xl font-medium">
          {t(isNativeApp() ? 'descriptionNative' : 'description')}
        </span>
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
