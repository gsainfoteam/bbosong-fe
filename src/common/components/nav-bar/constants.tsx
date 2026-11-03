import { type ParseKeys } from 'i18next';

export type NavItem = {
  to: string;
  labelKey: ParseKeys<'nav'>;
};

export const NAV_ITEMS: NavItem[] = [
  {
    to: '/mypage',
    labelKey: 'mypage', // t('nav:mypage')
  },
  {
    to: '/map',
    labelKey: 'map', // t('nav:map')
  },
];
