// @vitest-environment jsdom
import { createElement, type PropsWithChildren } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useLaundryRoomAlert } from './use-laundry-room-alert';

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  unsubscribe: vi.fn(),
  received: null as null | ((payload: unknown) => void),
}));

vi.mock('@/common/lib', () => ({
  AnalyticsEvent: { LAUNDRY_ROOM_ALERT_TOGGLED: 'toggled' },
  trackEvent: vi.fn(),
  subscribeToPushMessages: (listener: (payload: unknown) => void) => {
    mocks.received = listener;

    return mocks.unsubscribe;
  },
}));
vi.mock('../models', () => ({
  subscribeLaundryRoomAlert: vi.fn(),
  unsubscribeLaundryRoomAlert: vi.fn(),
  toLaundryRoomAlertKey: (target: { location: string }) => target.location,
}));
vi.mock('./use-laundry-room-subscriptions', () => ({
  useLaundryRoomSubscriptions: () => ({
    data: [],
    isLoading: false,
    isError: false,
    refresh: mocks.refresh,
  }),
}));
vi.mock('./use-push-device', () => ({ usePushPermission: () => ({ status: 'granted' }) }));

const wrapper = ({ children }: PropsWithChildren) =>
  createElement(QueryClientProvider, { client: new QueryClient() }, children);

beforeEach(() => {
  vi.clearAllMocks();
  mocks.received = null;
});

describe('useLaundryRoomAlert push sync', () => {
  it('refreshes the subscriptions whenever a push is received and unsubscribes on unmount', () => {
    const { unmount } = renderHook(() => useLaundryRoomAlert(), { wrapper });

    mocks.received?.({ data: { type: 'laundry-room-available' } });
    expect(mocks.refresh).toHaveBeenCalledOnce();

    unmount();
    expect(mocks.unsubscribe).toHaveBeenCalledOnce();
  });
});
