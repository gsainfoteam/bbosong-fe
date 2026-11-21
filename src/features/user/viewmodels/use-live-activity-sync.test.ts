// @vitest-environment jsdom
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type LiveActivityTarget } from './live-activity-state';
import { useLiveActivitySync } from './use-live-activity-sync';

const mocks = vi.hoisted(() => ({
  supported: vi.fn(),
  start: vi.fn(),
  register: vi.fn(),
  unregister: vi.fn(),
  onToken: undefined as ((event: unknown) => void) | undefined,
  onEnded: undefined as ((event: unknown) => void) | undefined,
}));

vi.mock('@/common/lib', () => ({
  $api: {
    useMutation: (method: string) => ({
      mutate: method === 'post' ? mocks.register : mocks.unregister,
    }),
  },
  isLiveActivitySupported: mocks.supported,
  startLiveActivity: mocks.start,
  subscribeToLiveActivityPushToken: (listener: (event: unknown) => void) => {
    mocks.onToken = listener;
    return () => {};
  },
  subscribeToLiveActivityEnded: (listener: (event: unknown) => void) => {
    mocks.onEnded = listener;
    return () => {};
  },
}));
vi.mock('../models', () => ({
  ApiPaths: {
    MachineController_registerLiveActivity: '/machine/{uuid}/live-activity',
    MachineController_unregisterLiveActivity: '/machine/{uuid}/live-activity',
  },
  LiveActivityEnvironment: { SANDBOX: 'SANDBOX', PRODUCTION: 'PRODUCTION' },
}));

const target: LiveActivityTarget = {
  machineUuid: 'machine-1',
  title: 'A동 건조기 3번',
  startedAt: new Date().toISOString(),
  status: 'RUNNING',
  thinqCurrentState: 'RUNNING',
  remainingMinutes: 20,
  thinqUpdatedAt: new Date().toISOString(),
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.onToken = undefined;
  mocks.onEnded = undefined;
  mocks.supported.mockResolvedValue(true);
  mocks.start.mockResolvedValue(undefined);
});
afterEach(cleanup);

describe('useLiveActivitySync', () => {
  it('does nothing when Live Activities are not supported', async () => {
    mocks.supported.mockResolvedValue(false);
    renderHook(() => useLiveActivitySync([target]));
    await waitFor(() => expect(mocks.supported).toHaveBeenCalled());

    expect(mocks.start).not.toHaveBeenCalled();
    expect(mocks.onToken).toBeUndefined();
  });

  it('starts an activity for each target with the current content', async () => {
    renderHook(() => useLiveActivitySync([target]));
    await waitFor(() => expect(mocks.start).toHaveBeenCalledOnce());

    expect(mocks.start).toHaveBeenCalledWith(
      expect.objectContaining({
        machineUuid: 'machine-1',
        title: 'A동 건조기 3번',
        startedAt: expect.any(Number),
        state: 'RUNNING',
        remainingMinutes: 20,
      }),
    );
  });

  it('does not restart for a re-render with the same content, but does when it changes', async () => {
    const { rerender } = renderHook(({ items }) => useLiveActivitySync(items), {
      initialProps: { items: [target] },
    });
    await waitFor(() => expect(mocks.start).toHaveBeenCalledTimes(1));

    rerender({ items: [{ ...target }] });
    expect(mocks.start).toHaveBeenCalledTimes(1);

    rerender({ items: [{ ...target, remainingMinutes: 10 }] });
    await waitFor(() => expect(mocks.start).toHaveBeenCalledTimes(2));
  });

  it('swallows start failures such as Live Activities being disabled in Settings', async () => {
    mocks.start.mockRejectedValue(new Error('DISABLED'));
    renderHook(() => useLiveActivitySync([target]));

    await waitFor(() => expect(mocks.start).toHaveBeenCalledOnce());
  });

  it('registers the push token with the server whenever it is issued', async () => {
    renderHook(() => useLiveActivitySync([target]));
    await waitFor(() => expect(mocks.onToken).toBeDefined());

    mocks.onToken?.({ machineUuid: 'machine-1', token: 'abcd', environment: 'SANDBOX' });

    expect(mocks.register).toHaveBeenCalledWith(
      {
        params: { path: { uuid: 'machine-1' } },
        body: { pushToken: 'abcd', environment: 'SANDBOX' },
      },
      expect.any(Object),
    );
  });

  it('unregisters the last token when the activity ends', async () => {
    renderHook(() => useLiveActivitySync([target]));
    await waitFor(() => expect(mocks.onEnded).toBeDefined());

    mocks.onToken?.({ machineUuid: 'machine-1', token: 'abcd', environment: 'PRODUCTION' });
    mocks.onToken?.({ machineUuid: 'machine-1', token: 'ef01', environment: 'PRODUCTION' });
    mocks.onEnded?.({ machineUuid: 'machine-1' });

    expect(mocks.unregister).toHaveBeenCalledExactlyOnceWith(
      { params: { path: { uuid: 'machine-1' } }, body: { pushToken: 'ef01' } },
      expect.any(Object),
    );
  });

  it('ignores an ended activity that never had a token', async () => {
    renderHook(() => useLiveActivitySync([target]));
    await waitFor(() => expect(mocks.onEnded).toBeDefined());

    mocks.onEnded?.({ machineUuid: 'machine-1' });

    expect(mocks.unregister).not.toHaveBeenCalled();
  });
});
