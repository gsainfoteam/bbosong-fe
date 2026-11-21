import { Link } from '@tanstack/react-router';

import { ChevronLeft, RefreshCw, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';

const iconButton =
  'text-ink active:bg-soft grid size-11 place-items-center rounded-tile transition-colors disabled:cursor-not-allowed';

export const Header = ({ onRefresh, isRefreshing = false, className, ...props }: Header.Props) => {
  const { t } = useTranslation('common');

  return (
    <header
      className={cn('flex h-14 w-full items-center justify-between pr-2.5 pl-5', className)}
      {...props}
    >
      <span className="flex items-center gap-[7px] text-[19px] font-extrabold tracking-[-0.03em]">
        <BrandMark />
        {t('bbosong')}
      </span>
      <div className="flex items-center">
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

export const MyPageHeader = () => {
  const { t } = useTranslation('common');
  return (
    <header className="flex h-14 w-full items-center px-2">
      <Link to="/" aria-label={t('index')} className={iconButton}>
        <ChevronLeft size={24} aria-hidden />
      </Link>
    </header>
  );
};

// 세탁기(원)와 건조기(둥근 사각)를 겹친 임시 마크. 로고가 정해지면 바꾼다.
function BrandMark() {
  return (
    <svg width="24" height="18" viewBox="0 0 24 18" aria-hidden className="block">
      <circle cx="8" cy="9" r="7.5" className="fill-sky-water" />
      <rect
        x="11"
        y="2.5"
        width="12.5"
        height="12.5"
        rx="3.6"
        strokeWidth="1.6"
        className="fill-orange-water stroke-white"
      />
    </svg>
  );
}

export namespace Header {
  export type Props = {
    onRefresh?: () => void;
    isRefreshing?: boolean;
    className?: string;
  };
}
