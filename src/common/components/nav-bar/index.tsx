import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';

import { NavButton } from '../ui';
import { NAV_ITEMS } from './constants';


export const NavBar = ({className, ...props}: NavBar.Props) => {
  const { t } = useTranslation();

  return (
    <div className={cn('flex flex-row justify-around', className)} {...props}>
      {NAV_ITEMS.map((item) => (
        <NavButton key={item.to} to={item.to} label={t(item.labelKey)} />
      ))}
    </div>
  );
};

export namespace NavBar {
  export type Props = {
    className?: string;
  };
}