// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  syncPushDevice,
  unregisterPushDeviceFromServer,
  useInstallPrompt,
  usePostInstallPermission,
  usePushDeviceSync,
  usePushPermission,
} from './use-push-device';

const browser = vi.hoisted(() => ({
  canPromptInstall: vi.fn(),
  isIOS: vi.fn(),
  isAndroid: vi.fn(),
  isAppInstalled: vi.fn(),
  getNotificationPermission: vi.fn(),
  isPushSupported: vi.fn(),
  needsInstall: vi.fn(),
  showInstallPrompt: vi.fn(),
  installListeners: new Set<() => void>(),
  isNativeApp: vi.fn(),
  getNativeNotificationPermission: vi.fn(),
  requestNativeNotificationPermission: vi.fn(),
  getNativePushPlatform: vi.fn(),
  getNativePushToken: vi.fn(),
  deleteNativePushToken: vi.fn(),
  subscribeToNativePermissionChange: vi.fn(),
  subscribeToNativeTokenRefresh: vi.fn(),
  subscribeToNativeResume: vi.fn(),
  trackEvent: vi.fn(),
  nativePermissionListeners: new Set<() => void>(),
  resumeListeners: new Set<() => void>(),
}));

const auth = vi.hoisted(() => ({ token: null as string | null }));

const models = vi.hoisted(() => ({
  registerNativePushDevice: vi.fn(),
  unregisterNativePushDevice: vi.fn(),
}));

vi.mock('@/common/lib', () => ({
  ...browser,
  subscribeToInstallPromptChange: (listener: () => void) => {
    browser.installListeners.add(listener);
    return () => browser.installListeners.delete(listener);
  },
}));
vi.mock('@/features/auth', () => ({ useToken: () => ({ token: auth.token }) }));
vi.mock('../models', () => ({
  ...models,
  NativePushPlatform: { IOS: 'IOS', ANDROID: 'ANDROID' },
}));

beforeEach(() => {
  vi.resetAllMocks();
  browser.canPromptInstall.mockReturnValue(true);
  browser.isIOS.mockReturnValue(false);
  browser.isAndroid.mockReturnValue(true);
  browser.isPushSupported.mockReturnValue(true);
  browser.needsInstall.mockReturnValue(true);
  browser.isAppInstalled.mockReturnValue(false);
  browser.getNotificationPermission.mockReturnValue('default');
  browser.isNativeApp.mockReturnValue(false);
  browser.getNativeNotificationPermission.mockReturnValue('default');
  browser.getNativePushPlatform.mockReturnValue('android');
  browser.getNativePushToken.mockResolvedValue('fcm-token');
  browser.deleteNativePushToken.mockResolvedValue(undefined);
  browser.requestNativeNotificationPermission.mockResolvedValue('granted');
  browser.subscribeToNativePermissionChange.mockImplementation((listener: () => void) => {
    browser.nativePermissionListeners.add(listener);
    return () => browser.nativePermissionListeners.delete(listener);
  });
  browser.subscribeToNativeTokenRefresh.mockReturnValue(() => {});
  browser.subscribeToNativeResume.mockImplementation((listener: () => void) => {
    browser.resumeListeners.add(listener);
    return () => browser.resumeListeners.delete(listener);
  });
  browser.resumeListeners.clear();
  auth.token = null;
  models.registerNativePushDevice.mockResolvedValue({ success: true });
  models.unregisterNativePushDevice.mockResolvedValue({ success: true });
  browser.nativePermissionListeners.clear();
});

describe('post-install notification guidance', () => {
  it('opens after installation and updates the permission card without a permission change', () => {
    const { result } = renderHook(() => ({
      sheet: usePostInstallPermission(),
      permission: usePushPermission(),
    }));
    expect(result.current.sheet.isOpen).toBe(false);
    expect(result.current.permission.status).toBe('needs-install');

    act(() => {
      browser.isAppInstalled.mockReturnValue(true);
      browser.needsInstall.mockReturnValue(false);
      browser.installListeners.forEach((listener) => listener());
    });

    expect(result.current.sheet.isOpen).toBe(true);
    expect(result.current.permission.status).toBe('default');
  });

  it('opens on standalone launch, including iOS without an installation event', () => {
    browser.isIOS.mockReturnValue(true);
    browser.isAppInstalled.mockReturnValue(true);
    browser.needsInstall.mockReturnValue(false);
    const { result } = renderHook(() => usePostInstallPermission());
    expect(result.current.isOpen).toBe(true);
  });

  it('stays closed after dismissal even when installation listeners notify again', () => {
    browser.isAppInstalled.mockReturnValue(true);
    browser.needsInstall.mockReturnValue(false);
    const { result } = renderHook(() => usePostInstallPermission());
    act(() => result.current.dismiss());
    act(() => browser.installListeners.forEach((listener) => listener()));
    expect(result.current.isOpen).toBe(false);
  });

  it('closes when permission is granted', () => {
    browser.isAppInstalled.mockReturnValue(true);
    browser.needsInstall.mockReturnValue(false);
    const { result } = renderHook(() => usePostInstallPermission());
    expect(result.current.isOpen).toBe(true);
    act(() => {
      browser.getNotificationPermission.mockReturnValue('granted');
      window.dispatchEvent(new Event('focus'));
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('shows browser settings guidance when notifications are denied', () => {
    browser.isAppInstalled.mockReturnValue(true);
    browser.needsInstall.mockReturnValue(false);
    browser.getNotificationPermission.mockReturnValue('denied');
    const { result } = renderHook(() => usePostInstallPermission());
    expect(result.current.isOpen).toBe(true);
  });

  it('does not open in an installed browser without push support', () => {
    browser.isAppInstalled.mockReturnValue(true);
    browser.needsInstall.mockReturnValue(false);
    browser.isPushSupported.mockReturnValue(false);
    const { result } = renderHook(() => usePostInstallPermission());
    expect(result.current.isOpen).toBe(false);
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('manual installation guidance', () => {
  it.each(['dismissed', 'unavailable'])(
    'shows the guide after %s even if a prompt is available',
    async (outcome) => {
      browser.showInstallPrompt.mockResolvedValue(outcome);
      const { result } = renderHook(() => useInstallPrompt());
      expect(result.current.showManualGuide).toBe(false);
      await act(() => result.current.promptInstall());
      expect(result.current.showManualGuide).toBe(true);
      expect(result.current.isPrompting).toBe(false);
    },
  );

  it('shows the guide after an installation error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    browser.showInstallPrompt.mockRejectedValue(new Error('install failed'));
    const { result } = renderHook(() => useInstallPrompt());
    await act(() => result.current.promptInstall());
    expect(result.current.showManualGuide).toBe(true);
    expect(result.current.isAndroid).toBe(true);
    expect(result.current.isPrompting).toBe(false);
  });

  it('shows the guide when automatic installation is unavailable', () => {
    browser.canPromptInstall.mockReturnValue(false);
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.showManualGuide).toBe(true);
  });

  it('offers installation in an iOS tab without push APIs', () => {
    browser.isIOS.mockReturnValue(true);
    browser.isPushSupported.mockReturnValue(false);
    const { result } = renderHook(() => usePushPermission());
    expect(result.current.status).toBe('needs-install');
  });

  it('keeps an unsupported installed browser marked as unsupported', () => {
    browser.isIOS.mockReturnValue(true);
    browser.isPushSupported.mockReturnValue(false);
    browser.needsInstall.mockReturnValue(false);
    const { result } = renderHook(() => usePushPermission());
    expect(result.current.status).toBe('unsupported');
  });
});

describe('native app (FCM)', () => {
  beforeEach(() => {
    browser.isNativeApp.mockReturnValue(true);
    browser.isAppInstalled.mockReturnValue(true);
    browser.needsInstall.mockReturnValue(false);
    // 네이티브 WebView에는 Web Push API가 없다
    browser.isPushSupported.mockReturnValue(false);
  });

  it.each([
    ['default', 'default'],
    ['granted', 'granted'],
    ['denied', 'denied'],
  ] as const)('maps the native %s permission to the %s status', (permission, status) => {
    browser.getNativeNotificationPermission.mockReturnValue(permission);
    const { result } = renderHook(() => usePushPermission());
    expect(result.current.status).toBe(status);
    expect(result.current.isNative).toBe(true);
  });

  it('follows native permission changes after returning from the OS settings', () => {
    browser.getNativeNotificationPermission.mockReturnValue('denied');
    const { result } = renderHook(() => usePushPermission());
    expect(result.current.status).toBe('denied');

    act(() => {
      browser.getNativeNotificationPermission.mockReturnValue('granted');
      browser.nativePermissionListeners.forEach((listener) => listener());
    });

    expect(result.current.status).toBe('granted');
  });

  it('requests the native permission and registers the token once granted', async () => {
    browser.getNativeNotificationPermission.mockReturnValue('default');
    browser.requestNativeNotificationPermission.mockImplementation(async () => {
      browser.getNativeNotificationPermission.mockReturnValue('granted');
      return 'granted';
    });
    const { result } = renderHook(() => usePushPermission());

    await act(() => result.current.requestPermission());

    expect(browser.requestNativeNotificationPermission).toHaveBeenCalledOnce();
    expect(models.registerNativePushDevice).toHaveBeenCalledWith('ANDROID', 'fcm-token');
    expect(result.current.status).toBe('granted');
  });

  it('does not register a token when the permission is denied', async () => {
    browser.requestNativeNotificationPermission.mockImplementation(async () => {
      browser.getNativeNotificationPermission.mockReturnValue('denied');
      return 'denied';
    });
    const { result } = renderHook(() => usePushPermission());

    await act(() => result.current.requestPermission());

    expect(models.registerNativePushDevice).not.toHaveBeenCalled();
    expect(result.current.status).toBe('denied');
  });

  it('registers with the iOS platform on iOS', async () => {
    browser.getNativeNotificationPermission.mockReturnValue('granted');
    browser.getNativePushPlatform.mockReturnValue('ios');

    await syncPushDevice();

    expect(models.registerNativePushDevice).toHaveBeenCalledWith('IOS', 'fcm-token');
  });

  it('skips registration without permission or without a token', async () => {
    await syncPushDevice();
    expect(models.registerNativePushDevice).not.toHaveBeenCalled();

    browser.getNativeNotificationPermission.mockReturnValue('granted');
    browser.getNativePushToken.mockResolvedValue(null);
    await syncPushDevice();
    expect(models.registerNativePushDevice).not.toHaveBeenCalled();
  });

  it('unregisters the token on the server before invalidating it', async () => {
    const order: string[] = [];
    models.unregisterNativePushDevice.mockImplementation(async () => order.push('server'));
    browser.deleteNativePushToken.mockImplementation(async () => order.push('token'));

    await unregisterPushDeviceFromServer();

    expect(models.unregisterNativePushDevice).toHaveBeenCalledWith('fcm-token');
    expect(order).toEqual(['server', 'token']);
  });

  it('still invalidates the token when the server call fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    models.unregisterNativePushDevice.mockRejectedValue(new Error('network'));

    await expect(unregisterPushDeviceFromServer()).resolves.toBeUndefined();

    expect(browser.deleteNativePushToken).toHaveBeenCalledOnce();
  });

  it('never asks the user to install the app', () => {
    const { result } = renderHook(() => usePushPermission());
    expect(result.current.status).not.toBe('needs-install');
  });

  describe('registration retry', () => {
    beforeEach(() => {
      auth.token = 'access-token';
      browser.getNativeNotificationPermission.mockReturnValue('granted');
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('retries on app resume only after a failed registration', async () => {
      models.registerNativePushDevice.mockRejectedValueOnce(new Error('offline'));
      renderHook(() => usePushDeviceSync());
      await vi.waitFor(() => expect(models.registerNativePushDevice).toHaveBeenCalledTimes(1));

      await act(async () => browser.resumeListeners.forEach((listener) => listener()));
      await vi.waitFor(() => expect(models.registerNativePushDevice).toHaveBeenCalledTimes(2));

      // 성공한 뒤의 복귀에서는 다시 등록하지 않는다
      await act(async () => browser.resumeListeners.forEach((listener) => listener()));
      expect(models.registerNativePushDevice).toHaveBeenCalledTimes(2);
    });

    it('does not re-register on resume when the first registration succeeded', async () => {
      renderHook(() => usePushDeviceSync());
      await vi.waitFor(() => expect(models.registerNativePushDevice).toHaveBeenCalledTimes(1));

      await act(async () => browser.resumeListeners.forEach((listener) => listener()));

      expect(models.registerNativePushDevice).toHaveBeenCalledTimes(1);
    });
  });
});
