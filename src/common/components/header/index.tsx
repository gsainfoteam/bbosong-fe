import { Link } from '@tanstack/react-router';

import { Menu, RefreshCw, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';

export const Header = ({ onRefresh, isRefreshing = false, className, ...props }: Header.Props) => {
  const { t } = useTranslation('common');

  return (
    <header
      className={cn(className, 'text-text-primary flex w-full justify-between px-4 py-2')}
      {...props}
    >
      <h1>{t('bbosong')}</h1>
      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            type="button"
            aria-label={t('refresh')}
            aria-busy={isRefreshing}
            disabled={isRefreshing}
            onClick={onRefresh}
            className="disabled:cursor-not-allowed"
          >
            <RefreshCw className={cn(isRefreshing && 'animate-spin')} />
          </button>
        )}
        <Link to="/mypage" aria-label={t('myPage')}>
          <Menu />
        </Link>
      </div>
    </header>
  );
};

export const MyPageHeader = () => {
  const { t } = useTranslation('common');
  return (
    <header className="text-text-primary flex w-full flex-row-reverse px-4 py-2">
      <Link to="/" aria-label={t('index')}>
        <X />
      </Link>
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
