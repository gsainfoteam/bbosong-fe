// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const plugin = vi.hoisted(() => ({
  checkPermissions: vi.fn(),
  requestPermissions: vi.fn(),
  getToken: vi.fn(),
  deleteToken: vi.fn(),
  createChannel: vi.fn(),
  addListener: vi.fn(),
}));
const capacitor = vi.hoisted(() => ({ platform: 'android', native: true }));

vi.mock('@capacitor-firebase/messaging', () => ({
  FirebaseMessaging: plugin,
  Importance: { High: 4 },
}));
const app = vi.hoisted(() => ({ addListener: vi.fn() }));
vi.mock('@capacitor/app', () => ({ App: app }));
vi.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform: () => capacitor.platform },
}));
vi.mock('./platform', () => ({ isNativeApp: () => capacitor.native }));

import {
  NATIVE_PUSH_ANDROID_CHANNEL_ID,
  getNativeNotificationPermission,
  getNativePushPlatform,
  getNativePushToken,
  initNativePush,
  refreshNativeNotificationPermission,
  requestNativeNotificationPermission,
  subscribeToNativePermissionChange,
  subscribeToNativeResume,
} from './native-push';

beforeEach(() => {
  vi.resetAllMocks();
  capacitor.platform = 'android';
  capacitor.native = true;
  plugin.checkPermissions.mockResolvedValue({ receive: 'prompt' });
  plugin.createChannel.mockResolvedValue(undefined);
});

describe('native permission cache', () => {
  it.each([
    ['granted', 'granted'],
    ['denied', 'denied'],
    ['prompt', 'default'],
    ['prompt-with-rationale', 'default'],
  ] as const)('maps %s to %s', async (receive, expected) => {
    plugin.checkPermissions.mockResolvedValue({ receive });

    await expect(refreshNativeNotificationPermission()).resolves.toBe(expected);
    expect(getNativeNotificationPermission()).toBe(expected);
  });

  it('notifies listeners only when the permission actually changes', async () => {
    plugin.checkPermissions.mockResolvedValue({ receive: 'granted' });
    await refreshNativeNotificationPermission();
    const listener = vi.fn();
    const unsubscribe = subscribeToNativePermissionChange(listener);

    await refreshNativeNotificationPermission();
    expect(listener).not.toHaveBeenCalled();

    plugin.requestPermissions.mockResolvedValue({ receive: 'denied' });
    await requestNativeNotificationPermission();
    expect(listener).toHaveBeenCalledOnce();

    unsubscribe();
    plugin.checkPermissions.mockResolvedValue({ receive: 'granted' });
    await refreshNativeNotificationPermission();
    expect(listener).toHaveBeenCalledOnce();
  });
});

describe('native token', () => {
  it('returns null when no token is available', async () => {
    plugin.getToken.mockResolvedValue({ token: '' });
    await expect(getNativePushToken()).resolves.toBeNull();
  });

  it('returns the token', async () => {
    plugin.getToken.mockResolvedValue({ token: 'abc' });
    await expect(getNativePushToken()).resolves.toBe('abc');
  });

  it.each([
    ['ios', 'ios'],
    ['android', 'android'],
    ['web', 'android'],
  ] as const)('reports %s as %s', (platform, expected) => {
    capacitor.platform = platform;
    expect(getNativePushPlatform()).toBe(expected);
  });
});

describe('initNativePush', () => {
  it('does nothing outside the native app', async () => {
    capacitor.native = false;
    await initNativePush();
    expect(plugin.checkPermissions).not.toHaveBeenCalled();
  });

  it('creates the Android channel the server targets', async () => {
    await initNativePush();
    expect(plugin.createChannel).toHaveBeenCalledWith(
      expect.objectContaining({ id: NATIVE_PUSH_ANDROID_CHANNEL_ID, importance: 4 }),
    );
  });

  it('does not create a channel on iOS', async () => {
    capacitor.platform = 'ios';
    await initNativePush();
    expect(plugin.createChannel).not.toHaveBeenCalled();
  });

  it('never throws so app startup is not blocked', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    plugin.checkPermissions.mockRejectedValue(new Error('unavailable'));
    await expect(initNativePush()).resolves.toBeUndefined();
  });
});

describe('resume handling', () => {
  const resumeHandler = () =>
    app.addListener.mock.calls.find(([event]) => event === 'resume')?.[1] as () => void;

  it('registers the resume listener even when the initial work fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    plugin.checkPermissions.mockRejectedValue(new Error('unavailable'));
    plugin.createChannel.mockRejectedValue(new Error('channel'));

    await initNativePush();

    expect(resumeHandler()).toBeTypeOf('function');
  });

  it('refreshes the permission, then notifies resume listeners', async () => {
    await initNativePush();
    const listener = vi.fn();
    subscribeToNativeResume(listener);
    plugin.checkPermissions.mockResolvedValue({ receive: 'granted' });

    resumeHandler()();
    await vi.waitFor(() => expect(listener).toHaveBeenCalledOnce());

    expect(getNativeNotificationPermission()).toBe('granted');
  });

  it('still notifies resume listeners when the permission lookup fails', async () => {
    await initNativePush();
    const listener = vi.fn();
    subscribeToNativeResume(listener);
    plugin.checkPermissions.mockRejectedValue(new Error('unavailable'));

    resumeHandler()();

    await vi.waitFor(() => expect(listener).toHaveBeenCalledOnce());
  });
});
