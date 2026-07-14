import { type ParseKeys } from 'i18next';

export type NavItem = {
  to: string;
  labelKey: ParseKeys;
};

export const NAV_ITEMS: NavItem[] = [
  {
    to: '/mypage',
    labelKey: 'nav.mypage', // t('nav.mypage')
  },
  {
    to: '/status',
    labelKey: 'nav.status', // t('nav.status')
  },
  {
    to: '/map',
    labelKey: 'nav.map', // t('nav.map')
  },
];
