import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';

import { NavButton } from '../ui';
import { NAV_ITEMS, type NavItem } from './constants';

export const NavBar = ({ className, ...props }: NavBar.Props) => {
  const { t } = useTranslation('nav');
  const label = { '/mypage': t('mypage'), '/map': t('map') } satisfies Record<NavItem, string>;

  return (
    <div className={cn('flex flex-row justify-around', className)} {...props}>
      {NAV_ITEMS.map((to) => (
        <NavButton key={to} to={to} label={label[to]} />
      ))}
    </div>
  );
};

export namespace NavBar {
  export type Props = {
    className?: string;
  };
}
