import { type ReactNode } from 'react';

import { ChevronLeft, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';

export function TopBar({ title, onBack, icon = 'back', trailing, className }: TopBar.Props) {
  const { t } = useTranslation('common');
  const Icon = icon === 'close' ? X : ChevronLeft;

  return (
    <header className={cn('relative flex h-14 w-full items-center px-2', className)}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label={icon === 'close' ? t('close') : t('goBack')}
          className="rounded-tile grid size-11 place-items-center transition-colors active:bg-current/10"
        >
          <Icon size={22} strokeWidth={2.2} aria-hidden />
        </button>
      )}
      {title && (
        <h1 className="absolute inset-x-16 truncate text-center text-[17px] leading-none font-extrabold tracking-[-0.025em]">
          {title}
        </h1>
      )}
      {trailing && <div className="ml-auto flex items-center">{trailing}</div>}
    </header>
  );
}

export namespace TopBar {
  export type Props = {
    title?: ReactNode;
    onBack?: () => void;
    icon?: 'back' | 'close';
    trailing?: ReactNode;
    className?: string;
  };
}
