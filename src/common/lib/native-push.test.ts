// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const plugin = vi.hoisted(() => ({
  checkPermissions: vi.fn(),
  requestPermissions: vi.fn(),
  getToken: vi.fn(),
  deleteToken: vi.fn(),
  createChannel: vi.fn(),
  addListener: vi.fn(),
}));
const localNotifications = vi.hoisted(() => ({ schedule: vi.fn(), addListener: vi.fn() }));
const capacitor = vi.hoisted(() => ({ platform: 'android', native: true }));

vi.mock('@capacitor-firebase/messaging', () => ({
  FirebaseMessaging: plugin,
  Importance: { High: 4 },
}));
const app = vi.hoisted(() => ({ addListener: vi.fn() }));
vi.mock('@capacitor/local-notifications', () => ({ LocalNotifications: localNotifications }));
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
  subscribeToNativeNotificationTap,
  subscribeToNativePermissionChange,
  subscribeToNativePushReceived,
  subscribeToNativeResume,
  toPushMessagePayload,
  toSafeAppPath,
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

describe('toSafeAppPath', () => {
  it.each(['/', '/machines/1?tab=a#x', '/auth?redirect=%2F'])('allows %s', (url) => {
    expect(toSafeAppPath(url)).toBe(url);
  });

  it.each([
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    'javascript:alert(1)',
    'me.gistory.bbosong://auth/callback',
    'relative/path',
    '/a\nb',
    '',
    undefined,
    42,
  ])('rejects %j', (url) => {
    expect(toSafeAppPath(url)).toBeNull();
  });
});

describe('toPushMessagePayload', () => {
  it('flattens FCM data into the Web Push payload shape', () => {
    expect(
      toPushMessagePayload({
        title: '빈 기기',
        body: '세탁기가 비었어요',
        data: { url: '/', icon: '/i.png', type: 'laundry-room-available', location: 'A' },
      }),
    ).toEqual({
      title: '빈 기기',
      body: '세탁기가 비었어요',
      url: '/',
      icon: '/i.png',
      data: { type: 'laundry-room-available', location: 'A' },
    });
  });

  it('tolerates missing data', () => {
    expect(toPushMessagePayload({})).toEqual({
      title: undefined,
      body: undefined,
      url: undefined,
      icon: undefined,
      data: {},
    });
  });
});

describe('subscribeToNativePushReceived', () => {
  it('forwards foreground notifications as normalized payloads and removes the listener', async () => {
    const remove = vi.fn().mockResolvedValue(undefined);
    plugin.addListener.mockResolvedValue({ remove });
    const listener = vi.fn();

    const unsubscribe = subscribeToNativePushReceived(listener);
    const [event, handler] = plugin.addListener.mock.calls[0];
    expect(event).toBe('notificationReceived');

    handler({ notification: { title: 't', data: { type: 'machine-completion' } } });
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ title: 't', data: { type: 'machine-completion' } }),
    );

    unsubscribe();
    await vi.waitFor(() => expect(remove).toHaveBeenCalledOnce());
  });
});

describe('notification tap', () => {
  // 모듈 상태(보관된 탭 경로)가 테스트 사이로 새지 않도록 비운다
  afterEach(() => subscribeToNativeNotificationTap(() => {})());

  const tapHandler = async () => {
    await initNativePush();
    const call = plugin.addListener.mock.calls.find(
      ([event]) => event === 'notificationActionPerformed',
    );

    return call?.[1] as (event: { notification: { data?: unknown } }) => void;
  };

  it('delivers the tapped path to subscribers', async () => {
    const tap = await tapHandler();
    const listener = vi.fn();
    const unsubscribe = subscribeToNativeNotificationTap(listener);

    tap({ notification: { data: { url: '/machines' } } });
    expect(listener).toHaveBeenCalledExactlyOnceWith('/machines');

    unsubscribe();
    tap({ notification: { data: { url: '/later' } } });
    expect(listener).toHaveBeenCalledOnce();
  });

  it('ignores unsafe or missing urls', async () => {
    const tap = await tapHandler();
    tap({ notification: { data: { url: 'https://evil.example' } } });
    tap({ notification: { data: {} } });

    const listener = vi.fn();
    const unsubscribe = subscribeToNativeNotificationTap(listener);
    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });

  it('replays a cold-start tap once to the first subscriber', async () => {
    const tap = await tapHandler();
    tap({ notification: { data: { url: '/old' } } });
    tap({ notification: { data: { url: '/cold-start' } } });

    const first = vi.fn();
    const unsubscribe = subscribeToNativeNotificationTap(first);
    expect(first).toHaveBeenCalledExactlyOnceWith('/cold-start');
    unsubscribe();

    const second = vi.fn();
    subscribeToNativeNotificationTap(second)();
    expect(second).not.toHaveBeenCalled();
  });
});

describe('Android foreground head-up', () => {
  const received = () =>
    plugin.addListener.mock.calls.find(([event]) => event === 'notificationReceived')?.[1] as (e: {
      notification: unknown;
    }) => void;

  beforeEach(() => {
    localNotifications.schedule.mockResolvedValue(undefined);
  });

  it('shows a local notification on the default channel when permission is granted', async () => {
    plugin.checkPermissions.mockResolvedValue({ receive: 'granted' });
    await initNativePush();

    received()({ notification: { title: 't', body: 'b', data: { url: '/machines', type: 'x' } } });

    expect(localNotifications.schedule).toHaveBeenCalledWith({
      notifications: [
        expect.objectContaining({
          title: 't',
          body: 'b',
          channelId: NATIVE_PUSH_ANDROID_CHANNEL_ID,
          extra: { url: '/machines' },
        }),
      ],
    });
  });

  it('does nothing without permission', async () => {
    plugin.checkPermissions.mockResolvedValue({ receive: 'denied' });
    await initNativePush();

    received()({ notification: { title: 't' } });
    expect(localNotifications.schedule).not.toHaveBeenCalled();
  });

  it('is not registered on iOS (the system shows the banner)', async () => {
    capacitor.platform = 'ios';
    await initNativePush();
    expect(localNotifications.addListener).not.toHaveBeenCalled();
    expect(received()).toBeUndefined();
  });

  it('routes a tap on the local notification like a remote one', async () => {
    await initNativePush();
    const tap = localNotifications.addListener.mock.calls[0][1] as (e: {
      notification: { extra: unknown };
    }) => void;
    const listener = vi.fn();
    const unsubscribe = subscribeToNativeNotificationTap(listener);

    tap({ notification: { extra: { url: '/machines' } } });
    expect(listener).toHaveBeenCalledExactlyOnceWith('/machines');
    unsubscribe();
  });
});
