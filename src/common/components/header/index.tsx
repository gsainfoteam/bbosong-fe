import { Link } from '@tanstack/react-router';

import { Menu, RefreshCw, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';

import { IconButton } from '../ui';

export const Header = ({ onRefresh, isRefreshing = false, className, ...props }: Header.Props) => {
  const { t } = useTranslation('common');

  return (
    <header className={cn(className, 'text-ink flex w-full justify-between px-4 py-2')} {...props}>
      <h1>{t('bbosong')}</h1>
      <div className="flex items-center gap-3">
        {onRefresh && (
          <IconButton
            label={t('refresh')}
            aria-busy={isRefreshing}
            disabled={isRefreshing}
            onClick={onRefresh}
            className="-my-2"
          >
            <RefreshCw className={cn(isRefreshing && 'animate-spin')} aria-hidden />
          </IconButton>
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
    <header className="text-ink flex w-full flex-row-reverse px-4 py-2">
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
