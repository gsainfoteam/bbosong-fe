// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useInstallPrompt, usePushPermission } from './use-push-device';

const browser = vi.hoisted(() => ({
  canPromptInstall: vi.fn(),
  isIOS: vi.fn(),
  isAndroid: vi.fn(),
  isPushSupported: vi.fn(),
  needsInstall: vi.fn(),
  showInstallPrompt: vi.fn(),
}));

vi.mock('@/common/lib', () => ({
  ...browser,
  getNotificationPermission: () => 'default',
  subscribeToInstallPromptChange: () => () => {},
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
