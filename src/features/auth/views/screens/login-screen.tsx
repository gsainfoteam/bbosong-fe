import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { BrandMark, Button, LanguageButton } from '@/common/components';
import { isNativeApp } from '@/common/lib';
import { cn } from '@/common/utils';

export function LoginScreen({ onLogin, isPending = false, className }: LoginScreen.Props) {
  const { t } = useTranslation('auth');

  return (
    <div className={cn('bg-surface flex min-h-dvh flex-1 flex-col', className)}>
      <div className="flex h-12 items-center justify-end px-4">
        <LanguageButton />
      </div>
      <div className="flex flex-1 flex-col items-center pt-[clamp(40px,17dvh,144px)]">
        <BrandMark size={112} />
        <h1 className="mt-6 text-[34px] leading-[1.2] font-extrabold tracking-[-0.035em]">
          {t('bbosong')}
        </h1>
        <p className="text-ink-2 mt-2 text-[15px]">
          {isNativeApp() ? t('descriptionNative') : t('description')}
        </p>
      </div>
      <div className="pb-cta px-5">
        <Button
          type="button"
          size="l"
          wide
          aria-busy={isPending}
          onClick={() => !isPending && onLogin()}
        >
          {isPending ? <Loader2 size={20} className="animate-spin" aria-hidden /> : t('login')}
        </Button>
      </div>
    </div>
  );
}

export namespace LoginScreen {
  export type Props = {
    onLogin: () => void;
    isPending?: boolean;
    className?: string;
  };
}
