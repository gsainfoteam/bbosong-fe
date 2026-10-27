// @vitest-environment jsdom
import { createElement, type PropsWithChildren } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useUnregisterMachine } from './use-unregister-machine';

const mocks = vi.hoisted(() => ({
  request: vi.fn(),
  error: vi.fn(),
  success: vi.fn(),
}));
vi.mock('@/common/lib', async () => {
  const { useMutation } = await import('@tanstack/react-query');
  return {
    $api: {
      useMutation: (method: string, path: string, options: object) =>
        useMutation({
          mutationFn: (variables: unknown) => mocks.request(method, path, variables),
          ...options,
        }),
    },
  };
});
vi.mock('../models', () => ({
  ApiPaths: { MachineController_unregisterMachineUsage: '/machine/{uuid}/register' },
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('sonner', () => ({ toast: { error: mocks.error, success: mocks.success } }));

const variables = { params: { path: { uuid: 'machine-uuid' } } };
function setup(onUnregistered?: () => void) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidate = vi.spyOn(client, 'invalidateQueries');
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { client }, children);
  return { ...renderHook(() => useUnregisterMachine(onUnregistered), { wrapper }), invalidate };
}
beforeEach(() => vi.resetAllMocks());
afterEach(cleanup);

describe('machine unregistration', () => {
  it.each([
    [{ statusCode: 404 }, 'unregister.error.notRegistered'],
    [{ statusCode: 401 }, 'error:unauthorized'],
    [{ statusCode: 500 }, 'error:internalServerError'],
    [null, 'error:generic'],
    [new Error('Network error'), 'error:generic'],
  ])('shows the appropriate message for %j', async (error, message) => {
    mocks.request.mockRejectedValueOnce(error);
    const { result } = setup();
    act(() => result.current.mutate(variables));
    await waitFor(() => expect(mocks.error).toHaveBeenCalledExactlyOnceWith(message));
    expect(mocks.success).not.toHaveBeenCalled();
  });

  it('refreshes machine queries when the usage is no longer mine', async () => {
    mocks.request.mockRejectedValueOnce({ statusCode: 404 });
    const { result, invalidate } = setup();
    act(() => result.current.mutate(variables));
    await waitFor(() => expect(mocks.error).toHaveBeenCalledOnce());
    expect(invalidate).toHaveBeenCalledTimes(1);
  });

  it('treats an unsuccessful response as a failure', async () => {
    mocks.request.mockResolvedValueOnce({ success: false });
    const onUnregistered = vi.fn();
    const { result } = setup(onUnregistered);
    act(() => result.current.mutate(variables));
    await waitFor(() => expect(mocks.error).toHaveBeenCalledExactlyOnceWith('error:generic'));
    expect(onUnregistered).not.toHaveBeenCalled();
  });

  it('sends DELETE, refreshes machine queries and invokes the callback', async () => {
    mocks.request.mockResolvedValueOnce({ success: true });
    const onUnregistered = vi.fn();
    const { result, invalidate } = setup(onUnregistered);
    act(() => result.current.mutate(variables));
    await waitFor(() => expect(onUnregistered).toHaveBeenCalledExactlyOnceWith());
    expect(mocks.request).toHaveBeenCalledExactlyOnceWith(
      'delete',
      '/machine/{uuid}/register',
      variables,
    );
    expect(mocks.success).toHaveBeenCalledExactlyOnceWith('unregister.success');
    const predicate = invalidate.mock.calls[0][0]?.predicate;
    expect(predicate?.({ queryKey: ['get', '/machine/me'] } as never)).toBe(true);
    expect(predicate?.({ queryKey: ['get', '/user/me'] } as never)).toBe(false);
  });

  it('prevents duplicate requests and allows a retry after settling', async () => {
    let finish!: (data: { success: boolean }) => void;
    mocks.request.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const { result } = setup();
    act(() => {
      result.current.mutate(variables);
      result.current.mutate(variables);
    });
    await waitFor(() => expect(result.current.isPending).toBe(true));
    expect(mocks.request).toHaveBeenCalledTimes(1);
    await act(async () => finish({ success: true }));
    await waitFor(() => expect(result.current.isPending).toBe(false));
    mocks.request.mockResolvedValueOnce({ success: true });
    act(() => result.current.mutate(variables));
    await waitFor(() => expect(mocks.request).toHaveBeenCalledTimes(2));
  });
});
