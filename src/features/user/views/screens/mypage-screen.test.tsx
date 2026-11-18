// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MypageScreen } from './mypage-screen';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, ...props }: { to: string }) => <a href={to} {...props} />,
}));
// jsdom은 dialog.showModal을 지원하지 않으므로 Modal은 단순한 대체 구현으로 바꾼다
vi.mock('@/common/components', () => ({
  LanguageToggle: () => null,
  MyPageHeader: () => null,
  Modal: ({
    title,
    confirmText,
    onConfirm,
    onClose,
  }: {
    title: string;
    confirmText: string;
    onConfirm: () => void;
    onClose: () => void;
  }) => (
    <div role="dialog">
      <p>{title}</p>
      <button type="button" onClick={onClose}>
        modal.cancel
      </button>
      <button type="button" onClick={onConfirm}>
        {confirmText}
      </button>
    </div>
  ),
}));
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
    render(
      <MypageScreen
        user={{ ...baseUser, role: 'admin' }}
        onLogout={() => {}}
        onWithdraw={() => {}}
      />,
    );
    expect(screen.getByRole('link', { name: 'toAdmin' }).getAttribute('href')).toBe('/admin');
  });
  it('hides the admin console link from ordinary users', () => {
    render(
      <MypageScreen
        user={{ ...baseUser, role: 'user' }}
        onLogout={() => {}}
        onWithdraw={() => {}}
      />,
    );
    expect(screen.queryByRole('link', { name: 'toAdmin' })).toBeNull();
  });
});

describe('MypageScreen withdraw', () => {
  it('asks for confirmation before withdrawing', () => {
    const onWithdraw = vi.fn();
    render(
      <MypageScreen
        user={{ ...baseUser, role: 'user' }}
        onLogout={() => {}}
        onWithdraw={onWithdraw}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'withdraw' }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(onWithdraw).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'withdrawConfirm' }));
    expect(onWithdraw).toHaveBeenCalledTimes(1);
  });
  it('closes the confirmation without withdrawing when cancelled', () => {
    const onWithdraw = vi.fn();
    render(
      <MypageScreen
        user={{ ...baseUser, role: 'user' }}
        onLogout={() => {}}
        onWithdraw={onWithdraw}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'withdraw' }));
    fireEvent.click(screen.getByRole('button', { name: 'modal.cancel' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onWithdraw).not.toHaveBeenCalled();
  });
});

describe('MypageScreen version', () => {
  it('shows the current app version', () => {
    render(
      <MypageScreen
        user={{ ...baseUser, role: 'user' }}
        onLogout={() => {}}
        onWithdraw={() => {}}
      />,
    );
    expect(screen.getByText('version')).toBeTruthy();
  });
});
