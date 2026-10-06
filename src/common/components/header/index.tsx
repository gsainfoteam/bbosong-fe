import { Link } from '@tanstack/react-router';

import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';

export const Header = ({ className, ...props }: Header.Props) => {
  const { t } = useTranslation('common');

  return (
    <header
      className={cn(className, 'text-text-primary flex w-full justify-between px-4 py-2')}
      {...props}
    >
      <h1>{t('bbosong')}</h1>
      <Link to="/mypage" aria-label={t('myPage')}>
        <Menu />
      </Link>
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
    className?: string;
  };
}
