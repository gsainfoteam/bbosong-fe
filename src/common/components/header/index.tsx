import { Link } from '@tanstack/react-router';

import { RefreshCw, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';

import { BrandMark, IconButton } from '../ui';

export const Header = ({ onRefresh, isRefreshing = false, className, ...props }: Header.Props) => {
  const { t } = useTranslation('common');

  return (
    <header
      className={cn(
        'text-ink pt-safe h-header sticky top-0 z-10 flex w-full items-center justify-between bg-inherit pr-2.5 pl-5',
        className,
      )}
      {...props}
    >
      <span className="flex items-center gap-[7px] text-[19px] font-extrabold tracking-[-0.03em]">
        <BrandMark size={26} />
        {t('bbosong')}
      </span>
      <div className="flex items-center">
        {onRefresh && (
          <IconButton
            label={t('refresh')}
            aria-busy={isRefreshing}
            disabled={isRefreshing}
            onClick={onRefresh}
          >
            <RefreshCw size={20} className={cn(isRefreshing && 'animate-spin')} aria-hidden />
          </IconButton>
        )}
        <IconButton asChild label={t('myPage')}>
          <Link to="/mypage">
            <UserRound size={20} aria-hidden />
          </Link>
        </IconButton>
      </div>
    </header>
  );
};

export namespace Header {
  export type Props = {
    onRefresh?: () => void;
    isRefreshing?: boolean;
    className?: string;
  };
}
