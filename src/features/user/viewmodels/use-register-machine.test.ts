// @vitest-environment jsdom
import { createElement, type PropsWithChildren } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useRegisterMachine } from './use-register-machine';

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
  error: vi.fn(),
  success: vi.fn(),
  navigate: vi.fn(),
}));
vi.mock('@/common/lib', async () => {
  const { useMutation } = await import('@tanstack/react-query');
  return {
    $api: {
      useMutation: (_method: string, path: string, options: object) =>
        useMutation({
          mutationFn: (variables: unknown) => mocks.post(path, variables),
          ...options,
        }),
    },
  };
});
vi.mock('@tanstack/react-router', () => ({ useNavigate: () => mocks.navigate }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('sonner', () => ({ toast: { error: mocks.error, success: mocks.success } }));

const registerPath = '/machine/{uuid}/register';
const confirmPath = `${registerPath}/confirm-completion`;
const variables = { params: { path: { uuid: 'machine-uuid' } } };
const confirmationError = {
  statusCode: 409,
  errorCode: 'MACHINE_COMPLETION_CONFIRMATION_REQUIRED',
  usageUuid: 'usage-uuid',
};
function setup(onRegistered?: () => void) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidate = vi.spyOn(client, 'invalidateQueries');
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { client }, children);
  return { ...renderHook(() => useRegisterMachine(onRegistered), { wrapper }), invalidate };
}
beforeEach(() => vi.resetAllMocks());
afterEach(cleanup);

async function openConfirmation(result: ReturnType<typeof setup>['result']) {
  mocks.post.mockRejectedValueOnce(confirmationError);
  act(() => result.current.mutate(variables));
  await waitFor(() =>
    expect(result.current.confirmation).toEqual({ uuid: 'machine-uuid', usageUuid: 'usage-uuid' }),
  );
  await waitFor(() => expect(result.current.isPending).toBe(false));
}

describe('machine registration', () => {
  it.each([
    [{ statusCode: 409, errorCode: 'MACHINE_ALREADY_REGISTERED' }, 'error.alreadyUsing'],
    [{ statusCode: 409 }, 'error.alreadyUsing'],
    [{ statusCode: 404, errorCode: 'MACHINE_NOT_RUNNING' }, 'error.notRunning'],
    [{ statusCode: 404, message: 'Machine not found.' }, 'error:notFound'],
    [{ statusCode: 400 }, 'error:badRequest'],
    [{ statusCode: 401 }, 'error:unauthorized'],
    [{ statusCode: 403 }, 'error:forbidden'],
    [
      { statusCode: 403, message: 'Machine gender does not match user gender.' },
      'error:genderMismatch',
    ],
    [{ statusCode: 500 }, 'error:internalServerError'],
    [new Error('Network error'), 'error:generic'],
    [{ ...confirmationError, usageUuid: undefined }, 'error:generic'],
  ])('shows the appropriate message for %j', async (error, message) => {
    mocks.post.mockRejectedValueOnce(error);
    const { result } = setup();
    act(() => result.current.mutate(variables));
    await waitFor(() => expect(mocks.error).toHaveBeenCalledExactlyOnceWith(message));
    expect(result.current.confirmation).toBeNull();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('refreshes machine queries and follows the existing success flow', async () => {
    mocks.post.mockResolvedValueOnce({ success: true });
    const { result, invalidate } = setup();
    act(() => result.current.mutate(variables));
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith({ to: '/' }));
    expect(mocks.success).toHaveBeenCalledExactlyOnceWith('success');
    const predicate = invalidate.mock.calls[0][0]?.predicate;
    expect(predicate?.({ queryKey: ['get', '/machine/{uuid}'] } as never)).toBe(true);
    expect(predicate?.({ queryKey: ['get', '/user/me'] } as never)).toBe(false);
  });

  it('cancels without confirming or changing registration', async () => {
    const { result } = setup();
    await openConfirmation(result);
    expect(mocks.error).not.toHaveBeenCalled();
    act(() => result.current.cancelConfirmation());
    expect(result.current.confirmation).toBeNull();
    expect(mocks.post).toHaveBeenCalledTimes(1);
    expect(mocks.success).not.toHaveBeenCalled();
  });

  it('confirms the exact session once and invokes the existing success callback', async () => {
    const onRegistered = vi.fn();
    const { result, invalidate } = setup(onRegistered);
    await openConfirmation(result);
    let finish!: (data: { success: boolean }) => void;
    mocks.post.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    act(() => {
      result.current.confirmCompletion();
      result.current.confirmCompletion();
      result.current.mutate(variables);
      result.current.cancelConfirmation();
    });
    await waitFor(() => expect(result.current.isPending).toBe(true));
    expect(result.current.confirmation).not.toBeNull();
    expect(mocks.post).toHaveBeenCalledTimes(2);
    expect(mocks.post).toHaveBeenLastCalledWith(confirmPath, {
      ...variables,
      body: { usageUuid: 'usage-uuid' },
    });
    await act(async () => finish({ success: true }));
    await waitFor(() => expect(onRegistered).toHaveBeenCalledExactlyOnceWith());
    expect(result.current.confirmation).toBeNull();
    expect(invalidate).toHaveBeenCalledTimes(1);
    expect(mocks.success).toHaveBeenCalledExactlyOnceWith('success');
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it.each([
    [{ statusCode: 409, errorCode: 'MACHINE_USAGE_CHANGED' }, 'error.usageChanged'],
    [{ statusCode: 409, errorCode: 'MACHINE_ALREADY_REGISTERED' }, 'error.alreadyUsing'],
    [{ statusCode: 404, errorCode: 'MACHINE_NOT_RUNNING' }, 'error.notRunning'],
    [new Error('Network error'), 'error:generic'],
  ])('closes failed confirmation and allows a fresh registration: %j', async (error, message) => {
    const { result, invalidate } = setup();
    await openConfirmation(result);
    mocks.post.mockRejectedValueOnce(error);
    act(() => result.current.confirmCompletion());
    await waitFor(() => expect(mocks.error).toHaveBeenCalledExactlyOnceWith(message));
    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.confirmation).toBeNull();
    if (message === 'error.usageChanged') expect(invalidate).toHaveBeenCalledTimes(1);
    expect(mocks.success).not.toHaveBeenCalled();
    mocks.post.mockResolvedValueOnce({ success: true });
    act(() => result.current.mutate(variables));
    await waitFor(() => expect(mocks.success).toHaveBeenCalledOnce());
    expect(mocks.post).toHaveBeenLastCalledWith(registerPath, variables);
  });

  it('prevents duplicate initial registration requests', async () => {
    mocks.post.mockImplementationOnce(() => new Promise(() => {}));
    const { result } = setup();
    act(() => {
      result.current.mutate(variables);
      result.current.mutate(variables);
    });
    await waitFor(() => expect(result.current.isPending).toBe(true));
    expect(mocks.post).toHaveBeenCalledTimes(1);
  });
});
