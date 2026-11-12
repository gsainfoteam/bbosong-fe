// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';

import { shouldPreferNativeBarcodeDetector } from './qr-decode-engine';

describe('shouldPreferNativeBarcodeDetector', () => {
  it('prefers native detector on Android when the API exists', () => {
    expect(
      shouldPreferNativeBarcodeDetector(
        'Mozilla/5.0 (Linux; Android 14; Pixel) Chrome/120.0.0.0 Mobile',
        true,
      ),
    ).toBe(true);
  });

  it('does not prefer native detector on iOS Safari even if the API is present', () => {
    expect(
      shouldPreferNativeBarcodeDetector(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        true,
      ),
    ).toBe(false);
  });

  it('does not prefer native detector when the API is missing', () => {
    expect(
      shouldPreferNativeBarcodeDetector(
        'Mozilla/5.0 (Linux; Android 14; Pixel) Chrome/120.0.0.0 Mobile',
        false,
      ),
    ).toBe(false);
  });
});

describe('createQrDecodeEngine', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
    vi.doUnmock('zxing-wasm/reader');
  });

  it('uses BarcodeDetector on Android when qr_code is supported', async () => {
    const detect = vi.fn().mockResolvedValue([{ rawValue: '1nf0.me/lzsCu' }]);
    class FakeBarcodeDetector {
      static getSupportedFormats = vi.fn().mockResolvedValue(['qr_code']);
      detect = detect;
    }
    vi.stubGlobal('BarcodeDetector', FakeBarcodeDetector);
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Linux; Android 14) Chrome/120.0.0.0 Mobile',
    });

    const { createQrDecodeEngine } = await import('./qr-decode-engine');
    const engine = await createQrDecodeEngine();
    expect(engine.kind).toBe('barcode-detector');

    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
    await expect(engine.decode(canvas)).resolves.toBe('1nf0.me/lzsCu');
  });

  it('falls back to lazy zxing-wasm when native detector is unavailable', async () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    });
    vi.stubGlobal('BarcodeDetector', undefined);

    const readBarcodes = vi.fn().mockResolvedValue([{ text: '1nf0.me/lzsCu' }]);
    const prepareZXingModule = vi.fn();
    vi.doMock('zxing-wasm/reader', () => ({
      readBarcodes,
      prepareZXingModule,
      ZXING_WASM_VERSION: '3.1.6',
    }));

    const { createQrDecodeEngine } = await import('./qr-decode-engine');
    const engine = await createQrDecodeEngine();
    expect(engine.kind).toBe('zxing-wasm');
    expect(prepareZXingModule).toHaveBeenCalled();

    const imageData = {
      data: new Uint8ClampedArray(16),
      width: 2,
      height: 2,
      colorSpace: 'srgb',
    } as ImageData;
    const canvas = {
      width: 2,
      height: 2,
      getContext: () => ({
        getImageData: () => imageData,
      }),
    } as unknown as HTMLCanvasElement;
    await expect(engine.decode(canvas)).resolves.toBe('1nf0.me/lzsCu');
    expect(readBarcodes).toHaveBeenCalledWith(
      imageData,
      expect.objectContaining({
        formats: ['QRCode'],
        tryHarder: true,
        tryRotate: true,
        tryInvert: true,
        maxNumberOfSymbols: 1,
      }),
    );
  });
});
