// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MypageScreen } from './mypage-screen';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, ...props }: { to: string }) => <a href={to} {...props} />,
}));
vi.mock('@/common/components', () => ({ LanguageToggle: () => null, MyPageHeader: () => null }));
vi.mock('@/features/push-notification', () => ({ PushPermissionCard: () => null }));
// 타입만 가져오지만 verbatimModuleSyntax로 배럴 import가 남으므로 비워 둔다
vi.mock('../../viewmodels', () => ({}));
afterEach(cleanup);

const baseUser = {
  name: '홍길동',
  studentNumber: '20261234',
  email: 'bbosong@gm.gist.ac.kr',
  gender: 'male',
} as const;

describe('MypageScreen admin link', () => {
  it('shows the admin console link to administrators', () => {
    render(<MypageScreen user={{ ...baseUser, role: 'admin' }} onLogout={() => {}} />);
    expect(screen.getByRole('link', { name: 'toAdmin' }).getAttribute('href')).toBe('/admin');
  });
  it('hides the admin console link from ordinary users', () => {
    render(<MypageScreen user={{ ...baseUser, role: 'user' }} onLogout={() => {}} />);
    expect(screen.queryByRole('link', { name: 'toAdmin' })).toBeNull();
  });
});

describe('MypageScreen version', () => {
  it('shows the current app version', () => {
    render(<MypageScreen user={{ ...baseUser, role: 'user' }} onLogout={() => {}} />);
    expect(screen.getByText('version')).toBeTruthy();
  });
});
