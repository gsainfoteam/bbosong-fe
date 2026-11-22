import { Link } from '@tanstack/react-router';

import { ArrowLeft, RefreshCw, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';

import { IconButton } from '../ui';

export const Header = ({ onRefresh, isRefreshing = false, className, ...props }: Header.Props) => {
  const { t } = useTranslation('common');

  return (
    <header
      className={cn(className, 'text-ink flex h-12 w-full items-center justify-between')}
      {...props}
    >
      <h1 className="text-heading">{t('bbosong')}</h1>
      <div className="-mr-2.5 flex items-center">
        {onRefresh && (
          <IconButton
            label={t('refresh')}
            aria-busy={isRefreshing}
            disabled={isRefreshing}
            onClick={onRefresh}
          >
            <RefreshCw size={22} className={cn(isRefreshing && 'animate-spin')} aria-hidden />
          </IconButton>
        )}
        <IconButton asChild label={t('myPage')}>
          <Link to="/mypage">
            <User size={22} aria-hidden />
          </Link>
        </IconButton>
      </div>
    </header>
  );
};

export const MyPageHeader = () => {
  const { t } = useTranslation('common');
  return (
    <header className="text-ink flex h-14 w-full items-center px-2">
      <IconButton asChild label={t('index')}>
        <Link to="/">
          <ArrowLeft size={22} aria-hidden />
        </Link>
      </IconButton>
    </header>
  );
};

export namespace Header {
  export type Props = {
    /** 없으면 새로고침 버튼을 숨긴다 */
    onRefresh?: () => void;
    isRefreshing?: boolean;
    className?: string;
  };
}
