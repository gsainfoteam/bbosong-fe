export const NAV_ITEMS = ['/mypage', '/map'] as const;

export type NavItem = (typeof NAV_ITEMS)[number];
