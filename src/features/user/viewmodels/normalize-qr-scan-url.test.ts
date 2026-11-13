import { describe, expect, it } from 'vitest';

import { extractMachineShortCodeFromQr, normalizeQrScanUrl } from './normalize-qr-scan-url';

describe('normalizeQrScanUrl', () => {
  it('trims whitespace', () => {
    expect(normalizeQrScanUrl('  https://bbosong.example/abc  ')).toBe(
      'https://bbosong.example/abc',
    );
  });

  it('keeps http and https schemes (case-insensitive)', () => {
    expect(normalizeQrScanUrl('https://bbosong.example/abc')).toBe('https://bbosong.example/abc');
    expect(normalizeQrScanUrl('HTTP://bbosong.example/abc')).toBe('HTTP://bbosong.example/abc');
  });

  it('prepends https:// when scheme is missing', () => {
    expect(normalizeQrScanUrl('bbosong.example/abc')).toBe('https://bbosong.example/abc');
    expect(normalizeQrScanUrl('bbosong.example/path/to/abc?x=1')).toBe(
      'https://bbosong.example/path/to/abc?x=1',
    );
  });

  it('normalizes absolute paths with a placeholder origin', () => {
    expect(normalizeQrScanUrl('/abc')).toBe('https://qr.local/abc');
    expect(normalizeQrScanUrl('/s/abc/')).toBe('https://qr.local/s/abc/');
  });
});

describe('extractMachineShortCodeFromQr', () => {
  it.each([
    ['https://bbosong.example/abc', 'abc'],
    ['http://bbosong.example/abc', 'abc'],
    ['HTTPS://BBOSONG.EXAMPLE/ABC', 'ABC'],
    ['bbosong.example/abc', 'abc'],
    ['  bbosong.example/abc/  ', 'abc'],
    ['bbosong.example/path/to/abc?x=1', 'abc'],
    ['https://bbosong.example/path/to/abc?x=1', 'abc'],
    ['/abc', 'abc'],
    ['/s/abc/', 'abc'],
    ['abc', 'abc'],
    ['  short-code  ', 'short-code'],
  ])('extracts short code from %j', (input, expected) => {
    expect(extractMachineShortCodeFromQr(input)).toBe(expected);
  });

  it('returns null for empty or whitespace-only input', () => {
    expect(extractMachineShortCodeFromQr('')).toBeNull();
    expect(extractMachineShortCodeFromQr('   ')).toBeNull();
  });
});
