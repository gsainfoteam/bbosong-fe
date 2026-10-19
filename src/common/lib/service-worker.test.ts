// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import {
  canPromptInstall,
  initInstallPromptCapture,
  isAndroid,
  isAppInstalled,
  isIOS,
  needsInstall,
  showInstallPrompt,
  subscribeToInstallPromptChange,
} from './service-worker';

function capturePrompt(
  prompt: () => Promise<void>,
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>,
) {
  const event = new Event('beforeinstallprompt', { cancelable: true });
  Object.assign(event, { prompt, userChoice });
  window.dispatchEvent(event);
}

beforeAll(() => initInstallPromptCapture());
afterEach(() => {
  window.dispatchEvent(new Event('appinstalled'));
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('completed installation', () => {
  it('recognizes installation in a regular tab and notifies subscribers', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    const listener = vi.fn();
    const unsubscribe = subscribeToInstallPromptChange(listener);

    window.dispatchEvent(new Event('appinstalled'));

    expect(isAppInstalled()).toBe(true);
    expect(needsInstall()).toBe(false);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    window.dispatchEvent(new Event('appinstalled'));
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('PWA installation', () => {
  it('returns unavailable when no install prompt exists', async () => {
    expect(await showInstallPrompt()).toBe('unavailable');
  });

  it.each(['accepted', 'dismissed'] as const)(
    'consumes a prompt with outcome %s',
    async (outcome) => {
      capturePrompt(vi.fn().mockResolvedValue(undefined), Promise.resolve({ outcome }));
      expect(await showInstallPrompt()).toBe(outcome);
      expect(canPromptInstall()).toBe(false);
    },
  );

  it('discards a prompt that fails to open', async () => {
    capturePrompt(
      vi.fn().mockRejectedValue(new Error('prompt failed')),
      Promise.resolve({ outcome: 'dismissed' }),
    );
    await expect(showInstallPrompt()).rejects.toThrow('prompt failed');
    expect(canPromptInstall()).toBe(false);
    expect(await showInstallPrompt()).toBe('unavailable');
  });

  it('does not reuse a prompt while waiting or clear a newer prompt', async () => {
    let complete!: () => void;
    const prompt = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          complete = resolve;
        }),
    );
    capturePrompt(prompt, Promise.resolve({ outcome: 'accepted' }));
    const pending = showInstallPrompt();
    expect(await showInstallPrompt()).toBe('unavailable');
    expect(prompt).toHaveBeenCalledTimes(1);
    capturePrompt(vi.fn().mockResolvedValue(undefined), Promise.resolve({ outcome: 'dismissed' }));
    complete();
    await pending;
    expect(canPromptInstall()).toBe(true);
  });

  it.each([
    ['Mozilla/5.0 (Linux; Android 14)', 'Linux', 0, false, true],
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', 'iPhone', 5, true, false],
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X)', 'MacIntel', 5, true, false],
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X)', 'MacIntel', 0, false, false],
  ])(
    'detects the platform for %s with %s and %i touch points',
    (userAgent, platform, maxTouchPoints, ios, android) => {
      vi.stubGlobal('navigator', { userAgent, platform, maxTouchPoints });
      expect(isIOS()).toBe(ios);
      expect(isAndroid()).toBe(android);
    },
  );
});
