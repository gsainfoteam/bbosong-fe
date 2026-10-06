import { Link, useRouter } from '@tanstack/react-router';

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
      <Link to="/mypage">
        <Menu />
      </Link>
    </header>
  );
};

export const MyPageHeader = () => {
  const router = useRouter();
  return (
    <header className="text-text-primary flex w-full flex-row-reverse px-4 py-2">
      <button type="button" onClick={() => router.history.back()}>
        <X />
      </button>
    </header>
  );
};

export namespace Header {
  export type Props = {
    className?: string;
  };
}
