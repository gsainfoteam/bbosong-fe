// @vitest-environment jsdom
import { type PropsWithChildren } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from 'zustand';

import { useAdminAccess } from './use-admin-access';

const mocks = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
const useTestToken = create<{ token: string | null; saveToken: (token: string | null) => void }>(
  (set) => ({ token: null, saveToken: (token) => set({ token }) }),
);
vi.mock('@/common/lib', () => ({ api: { GET: mocks.get, POST: mocks.post } }));
vi.mock('@/features/auth', () => ({
  useToken: Object.assign(
    (selector: (state: ReturnType<typeof useTestToken.getState>) => unknown) =>
      useTestToken(selector),
    { getState: () => useTestToken.getState() },
  ),
}));

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { ...renderHook(useAdminAccess, { wrapper }), client };
}
beforeEach(() => {
  vi.resetAllMocks();
  useTestToken.setState({ token: null });
});
afterEach(cleanup);

describe('admin access', () => {
  it('denies unauthenticated visitors after session restoration fails', async () => {
    mocks.post.mockResolvedValue({ error: { statusCode: 401 } });
    const { result } = setup();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAdmin).toBe(false);
    expect(mocks.get).not.toHaveBeenCalled();
  });
  it('restores an existing session before checking administrator access', async () => {
    mocks.post.mockResolvedValue({ data: { access_token: 'restored-session' } });
    mocks.get.mockResolvedValue({ data: { role: 'ADMIN', uuid: 'admin' } });
    const { result } = setup();
    await waitFor(() => expect(result.current.isAdmin).toBe(true));
    expect(useTestToken.getState().token).toBe('restored-session');
    expect(result.current.isLoading).toBe(false);
  });
  it('denies a logged-in ordinary user', async () => {
    useTestToken.setState({ token: 'user-session' });
    mocks.get.mockResolvedValue({ data: { role: 'USER' } });
    const { result } = setup();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAdmin).toBe(false);
    expect(mocks.post).not.toHaveBeenCalled();
  });
  it('does not reuse administrator profile data after the account changes', async () => {
    useTestToken.setState({ token: 'admin-session' });
    mocks.get
      .mockResolvedValueOnce({ data: { role: 'ADMIN' } })
      .mockResolvedValueOnce({ data: { role: 'USER' } });
    const { result } = setup();
    await waitFor(() => expect(result.current.isAdmin).toBe(true));
    act(() => useTestToken.getState().saveToken('ordinary-session'));
    expect(result.current.isAdmin).toBe(false);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAdmin).toBe(false);
  });
  it('fails closed when profile lookup fails', async () => {
    useTestToken.setState({ token: 'session' });
    mocks.get.mockResolvedValue({ error: { statusCode: 403 } });
    const { result } = setup();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAdmin).toBe(false);
  });
});
