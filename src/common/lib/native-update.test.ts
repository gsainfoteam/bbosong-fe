import { describe, expect, it, vi } from 'vitest';

import {
  isVersionAtLeast,
  parseUpdateManifest,
  shouldApplyUpdate,
  type NativeUpdateManifest,
} from './native-update';

vi.mock('@capacitor/app', () => ({ App: {} }));
vi.mock('@capgo/capacitor-updater', () => ({ CapacitorUpdater: {} }));
vi.mock('./platform', () => ({ APP_LINK_HOST: 'example.test', isNativeApp: () => false }));

const manifest: NativeUpdateManifest = {
  version: '0.3.15-abc1234',
  url: '/bundle-0.3.15-abc1234.zip',
  checksum: 'deadbeef',
  minNativeVersion: '0.3.15',
};

describe('isVersionAtLeast', () => {
  it('compares numerically per segment', () => {
    expect(isVersionAtLeast('0.3.15', '0.3.15')).toBe(true);
    expect(isVersionAtLeast('0.3.16', '0.3.15')).toBe(true);
    expect(isVersionAtLeast('0.10.0', '0.9.9')).toBe(true);
    expect(isVersionAtLeast('0.3.14', '0.3.15')).toBe(false);
    expect(isVersionAtLeast('1.0', '1.0.0')).toBe(true);
  });

  it('returns false for versions that cannot be parsed', () => {
    expect(isVersionAtLeast('abc', '0.3.15')).toBe(false);
    expect(isVersionAtLeast('0.3.15', '')).toBe(false);
  });
});

describe('parseUpdateManifest', () => {
  it('accepts a complete manifest', () => {
    expect(parseUpdateManifest(manifest)).toEqual(manifest);
  });

  it('rejects anything else', () => {
    expect(parseUpdateManifest(null)).toBeNull();
    expect(parseUpdateManifest('<html>')).toBeNull();
    expect(parseUpdateManifest({ ...manifest, checksum: '' })).toBeNull();
    expect(parseUpdateManifest({ ...manifest, url: undefined })).toBeNull();
  });
});

describe('shouldApplyUpdate', () => {
  const context = {
    currentVersion: '0.3.15-old0000',
    nativeVersion: '0.3.15',
    attemptedVersion: null,
  };

  it('applies a newer bundle', () => {
    expect(shouldApplyUpdate(manifest, context)).toBe(true);
  });

  it('skips the bundle that is already running', () => {
    expect(shouldApplyUpdate(manifest, { ...context, currentVersion: manifest.version })).toBe(
      false,
    );
  });

  it('skips when the native app is older than required', () => {
    expect(shouldApplyUpdate(manifest, { ...context, nativeVersion: '0.3.14' })).toBe(false);
  });

  it('skips a version that was already attempted', () => {
    expect(shouldApplyUpdate(manifest, { ...context, attemptedVersion: manifest.version })).toBe(
      false,
    );
  });
});
