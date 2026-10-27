// @vitest-environment jsdom
import { StrictMode, type PropsWithChildren } from 'react';

import { QueryClient } from '@tanstack/react-query';

import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '@/common/lib';
import { ApiPaths, useToken } from '@/features/auth';

import { App } from './app';
import { queryClient } from './router';
import { Route } from './routes/__root';

const mocks = vi.hoisted(() => {
  vi.stubEnv('DEV', false);
  vi.stubEnv('VITE_IDP_CLIENT_ID', 'test-client');
  vi.stubEnv('VITE_IDP_AUTHORIZE_URL', 'https://idp.example/authorize');
  vi.stubEnv('VITE_IDP_TOKEN_URL', 'https://idp.example/token');
  vi.stubEnv('VITE_IDP_REDIRECT_URI', 'https://app.example/auth');
  vi.stubEnv('VITE_API_BASE_URL', 'https://api.example');
  const fetch = vi.fn<typeof globalThis.fetch>();
  vi.stubGlobal('fetch', fetch);

  return {
    loginInProgress: false,
    authConfig: {} as { onRefreshTokenExpire: (args: { logIn: () => void }) => void },
    fetch,
  };
});

vi.mock('./router', () => ({ queryClient: new QueryClient(), router: {} }));
vi.mock('@/common/lib', async () => await import('@/common/lib/api'));
vi.mock('@/common/components', () => ({ Loading: () => <p>restoring</p> }));
vi.mock('@/common/pages', () => ({ ErrorPage: () => null, NotFoundPage: () => null }));
vi.mock('sonner', () => ({ Toaster: () => null }));
vi.mock('react-oauth2-code-pkce', () => ({
  AuthProvider: ({
    children,
    authConfig,
  }: PropsWithChildren & { authConfig: typeof mocks.authConfig }) => {
    mocks.authConfig = authConfig;
    return children;
  },
  useAuthContext: () => ({ loginInProgress: mocks.loginInProgress }),
}));
vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  RouterProvider: () => {
    const RootLayout = Route.options.component!;
    return <RootLayout />;
  },
  Outlet: () => {
    const token = useToken((state) => state.token);
    return <p>{token ? 'protected page' : 'login page'}</p>;
  },
}));

beforeEach(() => {
  vi.resetAllMocks();
  mocks.loginInProgress = false;
  queryClient.clear();
  useToken.setState({ token: null, idpToken: null });
  vi.stubGlobal('fetch', mocks.fetch);
});
afterEach(() => {
  cleanup();
  queryClient.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function jsonResponse(data: object, status = 200) {
  return Response.json(data, { status });
}

describe('boot session restoration', () => {
  it('waits for the refresh cookie and restores the session without an IDP token', async () => {
    let finish!: (response: Response) => void;
    mocks.fetch.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );

    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    expect(screen.getByText('restoring')).toBeTruthy();
    expect(screen.queryByText('login page')).toBeNull();
    expect(screen.queryByText('protected page')).toBeNull();
    await waitFor(() => expect(mocks.fetch).toHaveBeenCalledOnce());
    const request = mocks.fetch.mock.calls[0][0] as Request;
    expect(request.url).toContain('/auth/refresh');
    expect(request.method).toBe('POST');
    expect(request.credentials).toBe('include');

    await act(async () => finish(jsonResponse({ access_token: 'restored-session' })));
    await screen.findByText('protected page');
    expect(useToken.getState().token).toBe('restored-session');
    expect(useToken.getState().idpToken).toBeNull();
    expect(mocks.fetch).toHaveBeenCalledOnce();
    const logIn = vi.fn();
    mocks.authConfig.onRefreshTokenExpire({ logIn });
    expect(logIn).not.toHaveBeenCalled();
  });

  it('shows login without retrying an expired refresh cookie', async () => {
    mocks.fetch.mockResolvedValue(jsonResponse({ statusCode: 401 }, 401));
    render(<App />);
    await screen.findByText('login page');
    expect(useToken.getState().token).toBeNull();
    expect(mocks.fetch).toHaveBeenCalledOnce();
    expect(queryClient.getQueryData(['auth-session'])).toBe(false);
    const logIn = vi.fn();
    mocks.authConfig.onRefreshTokenExpire({ logIn });
    expect(logIn).toHaveBeenCalledOnce();
  });

  it.each(['unavailable', 'network error'])(
    'retries a transient failure before treating the user as logged out: %s',
    async (failure) => {
      vi.useFakeTimers();
      if (failure === 'unavailable') {
        mocks.fetch.mockResolvedValueOnce(jsonResponse({ statusCode: 503 }, 503));
      } else {
        mocks.fetch.mockRejectedValueOnce(new TypeError('Network error'));
      }
      mocks.fetch.mockResolvedValueOnce(jsonResponse({ access_token: 'restored-session' }));
      render(<App />);
      await act(async () => {});
      expect(screen.getByText('restoring')).toBeTruthy();
      expect(screen.queryByText('login page')).toBeNull();
      expect(queryClient.getQueryData(['auth-session'])).toBeUndefined();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1_001);
      });
      expect(screen.getByText('protected page')).toBeTruthy();
      expect(useToken.getState().token).toBe('restored-session');
      expect(mocks.fetch).toHaveBeenCalledTimes(2);
    },
  );

  it('stops retrying persistent server errors and releases the loading gate', async () => {
    vi.useFakeTimers();
    mocks.fetch.mockImplementation(() => Promise.resolve(jsonResponse({ statusCode: 503 }, 503)));
    render(<App />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4_000);
    });
    expect(mocks.fetch).toHaveBeenCalledTimes(3);
    expect(queryClient.getQueryState(['auth-session'])?.status).toBe('error');
    expect(queryClient.getQueryState(['auth-session'])?.error).toEqual({ statusCode: 503 });
    expect(queryClient.getQueryData(['auth-session'])).toBeUndefined();
    expect(screen.getByText('login page')).toBeTruthy();
    expect(useToken.getState().token).toBeNull();
  });

  it('aborts stalled requests and releases the loading gate after bounded retries', async () => {
    vi.useFakeTimers();
    const timeout = vi.spyOn(AbortSignal, 'timeout').mockImplementation((delay) => {
      const controller = new AbortController();
      setTimeout(() => controller.abort(new DOMException('Timed out', 'TimeoutError')), delay);
      return controller.signal;
    });
    mocks.fetch.mockImplementation(
      (input) =>
        new Promise((_resolve, reject) => {
          const request = input as Request;
          request.signal.addEventListener('abort', () => reject(request.signal.reason), {
            once: true,
          });
        }),
    );
    render(<App />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(9_999);
    });
    expect(screen.getByText('restoring')).toBeTruthy();
    expect(mocks.fetch).toHaveBeenCalledOnce();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(24_001);
    });
    expect(timeout).toHaveBeenCalledWith(10_000);
    expect(mocks.fetch).toHaveBeenCalledTimes(3);
    expect(mocks.fetch.mock.calls.every(([input]) => (input as Request).signal.aborted)).toBe(true);
    expect(queryClient.getQueryState(['auth-session'])?.status).toBe('error');
    expect(queryClient.getQueryState(['auth-session'])?.error).toMatchObject({
      name: 'TimeoutError',
    });
    expect(screen.getByText('login page')).toBeTruthy();
  });

  it('waits for the existing IDP callback after backend restoration fails', async () => {
    mocks.loginInProgress = true;
    mocks.fetch.mockResolvedValue(jsonResponse({ statusCode: 401 }, 401));
    const { rerender } = render(<App />);
    await waitFor(() =>
      expect(queryClient.getQueryState(['auth-session'])?.status).toBe('success'),
    );
    expect(screen.getByText('restoring')).toBeTruthy();
    expect(screen.queryByText('login page')).toBeNull();
    mocks.loginInProgress = false;
    rerender(<App />);
    await screen.findByText('login page');
  });

  it('does not wait for IDP restoration when the backend session is valid', async () => {
    mocks.loginInProgress = true;
    mocks.fetch.mockResolvedValue(jsonResponse({ access_token: 'restored-session' }));
    render(<App />);
    await screen.findByText('protected page');
    expect(screen.queryByText('restoring')).toBeNull();
    expect(useToken.getState().token).toBe('restored-session');
    expect(mocks.fetch).toHaveBeenCalledOnce();
  });

  it('does not restore again after logout, focus, reconnect, or remount', async () => {
    mocks.fetch.mockResolvedValue(jsonResponse({ access_token: 'restored-session' }));
    const first = render(<App />);
    await screen.findByText('protected page');
    act(() => useToken.getState().saveToken(null));
    await screen.findByText('login page');
    first.unmount();
    render(<App />);
    act(() => {
      window.dispatchEvent(new Event('focus'));
      window.dispatchEvent(new Event('online'));
    });
    await screen.findByText('login page');
    expect(mocks.fetch).toHaveBeenCalledOnce();
  });

  it('keeps the existing 401 refresh and request retry behavior', async () => {
    mocks.fetch
      .mockResolvedValueOnce(jsonResponse({ access_token: 'boot-session' }))
      .mockResolvedValueOnce(jsonResponse({ statusCode: 401 }, 401))
      .mockResolvedValueOnce(jsonResponse({ access_token: 'renewed-session' }))
      .mockResolvedValueOnce(jsonResponse({ uuid: 'user' }));
    render(<App />);
    await screen.findByText('protected page');
    let data;
    await act(async () => {
      ({ data } = await api.GET(ApiPaths.AuthController_getMe));
    });
    expect(data).toEqual({ uuid: 'user' });
    expect(useToken.getState().token).toBe('renewed-session');
    const retryRequest = mocks.fetch.mock.calls[3][0] as Request;
    expect(retryRequest.headers.get('Authorization')).toBe('Bearer renewed-session');
    expect(retryRequest.headers.get('x-retry')).toBe('true');
  });
});
