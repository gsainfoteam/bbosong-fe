// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useInstallPrompt, usePostInstallPermission, usePushPermission } from './use-push-device';

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
}));

vi.mock('@/common/lib', () => ({
  ...browser,
  subscribeToInstallPromptChange: (listener: () => void) => {
    browser.installListeners.add(listener);
    return () => browser.installListeners.delete(listener);
  },
}));
vi.mock('@/features/auth', () => ({ useToken: () => ({ token: null }) }));
vi.mock('../models', () => ({}));

beforeEach(() => {
  vi.resetAllMocks();
  browser.canPromptInstall.mockReturnValue(true);
  browser.isIOS.mockReturnValue(false);
  browser.isAndroid.mockReturnValue(true);
  browser.isPushSupported.mockReturnValue(true);
  browser.needsInstall.mockReturnValue(true);
  browser.isAppInstalled.mockReturnValue(false);
  browser.getNotificationPermission.mockReturnValue('default');
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
