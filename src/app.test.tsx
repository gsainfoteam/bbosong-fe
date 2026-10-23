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

  it.each(['unauthorized', 'network error'])(
    'shows login when restoration fails: %s',
    async (failure) => {
      if (failure === 'unauthorized') {
        mocks.fetch.mockResolvedValue(jsonResponse({ statusCode: 401 }, 401));
      } else {
        mocks.fetch.mockRejectedValue(new TypeError('Network error'));
      }
      render(<App />);
      await screen.findByText('login page');
      expect(useToken.getState().token).toBeNull();
      expect(mocks.fetch).toHaveBeenCalledOnce();
      const logIn = vi.fn();
      mocks.authConfig.onRefreshTokenExpire({ logIn });
      expect(logIn).toHaveBeenCalledOnce();
    },
  );

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
