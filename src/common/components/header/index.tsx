import { Link } from '@tanstack/react-router';

import { QrCode, RefreshCw, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';

import { BrandMark, Button } from '../ui';

const iconButton =
  'text-ink active:bg-soft grid size-11 place-items-center rounded-tile transition-colors disabled:cursor-not-allowed';

export const Header = ({
  onRefresh,
  isRefreshing = false,
  onRegister,
  className,
  ...props
}: Header.Props) => {
  const { t } = useTranslation('common');

  return (
    <header
      className={cn('flex h-14 w-full items-center justify-between pr-2.5 pl-5', className)}
      {...props}
    >
      <span className="flex items-center gap-[7px] text-[19px] font-extrabold tracking-[-0.03em]">
        <BrandMark size={26} />
        {t('bbosong')}
      </span>
      <div className="flex items-center">
        {onRegister && (
          <Button
            type="button"
            size="s"
            aria-label={t('registerLabel')}
            onClick={onRegister}
            className="mr-0.5 h-[34px] px-[11px]"
          >
            <QrCode size={17} aria-hidden />
            {t('register')}
          </Button>
        )}
        {onRefresh && (
          <button
            type="button"
            aria-label={t('refresh')}
            aria-busy={isRefreshing}
            disabled={isRefreshing}
            onClick={onRefresh}
            className={iconButton}
          >
            <RefreshCw size={20} className={cn(isRefreshing && 'animate-spin')} aria-hidden />
          </button>
        )}
        <Link to="/mypage" aria-label={t('myPage')} className={iconButton}>
          <UserRound size={20} aria-hidden />
        </Link>
      </div>
    </header>
  );
};

export namespace Header {
  export type Props = {
    onRefresh?: () => void;
    isRefreshing?: boolean;
    onRegister?: () => void;
    className?: string;
  };
}
