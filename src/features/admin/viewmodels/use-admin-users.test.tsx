// @vitest-environment jsdom
import { type PropsWithChildren } from 'react';

import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  type UseMutationOptions,
} from '@tanstack/react-query';

import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from 'zustand';

import { Gender, UserRole, type AdminUserWithSubscriptions } from './types';
import { useAdminActions } from './use-admin-actions';
import { useAdminUsers } from './use-admin-users';

const mocks = vi.hoisted(() => ({ get: vi.fn(), mutate: vi.fn() }));
const useTestToken = create<{ token: string | null }>(() => ({ token: 'admin-session' }));
vi.mock('@/features/auth', () => ({
  useToken: (selector: (state: ReturnType<typeof useTestToken.getState>) => unknown) =>
    useTestToken(selector),
}));
vi.mock('@/common/lib', () => ({
  api: { GET: mocks.get },
  $api: {
    useMutation: (_method: string, path: string, options: UseMutationOptions) =>
      useMutation({ mutationFn: (variables) => mocks.mutate(path, variables), ...options }),
  },
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const users: AdminUserWithSubscriptions[] = [
  {
    uuid: 'admin',
    name: '관리자',
    email: 'admin@example.com',
    studentNumber: '20260001',
    gender: Gender.MALE,
    role: UserRole.ADMIN,
    pushSubscriptions: [],
  },
  {
    uuid: 'member',
    name: '김뽀송',
    email: 'member@example.com',
    studentNumber: '20260002',
    gender: Gender.FEMALE,
    role: UserRole.USER,
    pushSubscriptions: [
      { uuid: 'device', userAgent: null, createdAt: '2026-10-20T01:00:00Z', lastActivatedAt: null },
    ],
  },
];
function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return {
    ...renderHook(() => ({ users: useAdminUsers(), actions: useAdminActions() }), { wrapper }),
    client,
  };
}
beforeEach(() => {
  vi.resetAllMocks();
  useTestToken.setState({ token: 'admin-session' });
  mocks.get.mockResolvedValue({ data: users });
});
afterEach(cleanup);

describe('admin users', () => {
  it('loads the users endpoint and combines search, role, and registered-device filters', async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.users.filtered).toHaveLength(2));
    expect(mocks.get).toHaveBeenCalledWith('/auth/users', { signal: expect.any(AbortSignal) });
    act(() => result.current.users.filters.setSearch(' MEMBER@EXAMPLE.COM '));
    expect(result.current.users.filtered.map((user) => user.uuid)).toEqual(['member']);
    act(() => result.current.users.filters.setSearch('20260002'));
    expect(result.current.users.filtered).toHaveLength(1);
    act(() => result.current.users.filters.setSearch('김뽀송'));
    expect(result.current.users.filtered).toHaveLength(1);
    act(() => {
      result.current.users.filters.setSearch('');
      result.current.users.filters.setRole(UserRole.USER);
      result.current.users.filters.setPushStatus('registered');
    });
    expect(result.current.users.filtered.map((user) => user.uuid)).toEqual(['member']);
    act(() => result.current.users.filters.setPushStatus('unregistered'));
    expect(result.current.users.filtered).toEqual([]);
  });
  it('keeps a user with a device but no successful send in the registered filter', async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.users.isSuccess).toBe(true));
    act(() => result.current.users.filters.setPushStatus('registered'));
    expect(result.current.users.filtered[0].pushSubscriptions[0].lastActivatedAt).toBeNull();
  });
  it('does not show the previous account list while fetching for a new account', async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.users.filtered).toHaveLength(2));
    mocks.get.mockImplementation(() => new Promise(() => {}));
    act(() => useTestToken.setState({ token: 'another-session' }));
    expect(result.current.users.filtered).toEqual([]);
    expect(result.current.users.isPending).toBe(true);
  });
  it('reports a forbidden response without retrying or presenting it as an empty successful result', async () => {
    mocks.get.mockResolvedValue({ error: { statusCode: 403 } });
    const { result } = setup();
    await waitFor(() => expect(result.current.users.isError).toBe(true));
    expect(mocks.get).toHaveBeenCalledTimes(1);
  });
  it('refetches the user list after a role change so role filters use the updated role', async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.users.isSuccess).toBe(true));
    act(() => result.current.users.filters.setRole(UserRole.ADMIN));
    expect(result.current.users.filtered).toHaveLength(1);
    mocks.get.mockResolvedValue({ data: users.map((user) => ({ ...user, role: UserRole.ADMIN })) });
    mocks.mutate.mockResolvedValue({ ...users[1], role: UserRole.ADMIN });
    await act(async () => {
      await result.current.actions.updateRole.mutateAsync({
        body: { targetUserUuid: 'member', targetRole: UserRole.ADMIN },
      });
    });
    await waitFor(() => expect(result.current.users.filtered).toHaveLength(2));
    expect(mocks.mutate).toHaveBeenCalledWith('/auth/role', {
      body: { targetUserUuid: 'member', targetRole: UserRole.ADMIN },
    });
    expect(mocks.get).toHaveBeenCalledTimes(2);
  });
});
