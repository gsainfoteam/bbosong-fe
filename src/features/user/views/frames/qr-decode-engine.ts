export type QrDecodeEngineKind = 'barcode-detector' | 'zxing-wasm';

export type QrDecodeEngine = {
  kind: QrDecodeEngineKind;
  decode: (canvas: HTMLCanvasElement) => Promise<string | null>;
};

type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>;
};

type BarcodeDetectorConstructor = {
  new (options?: { formats: string[] }): BarcodeDetectorLike;
  getSupportedFormats: () => Promise<string[]>;
};

/** Android(+Chrome/WebView)에서는 네이티브 BarcodeDetector를 우선한다. iOS Safari는 API가 없어 zxing-wasm으로 간다. */
export function shouldPreferNativeBarcodeDetector(
  userAgent: string,
  hasBarcodeDetectorApi: boolean,
): boolean {
  return hasBarcodeDetectorApi && /Android/i.test(userAgent);
}

async function canUseNativeBarcodeDetector(): Promise<boolean> {
  const Detector = (globalThis as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
  if (
    !shouldPreferNativeBarcodeDetector(
      globalThis.navigator?.userAgent ?? '',
      typeof Detector === 'function',
    )
  ) {
    return false;
  }
  try {
    const formats = await Detector!.getSupportedFormats();
    return formats.includes('qr_code');
  } catch {
    return false;
  }
}

function createBarcodeDetectorEngine(): QrDecodeEngine {
  const Detector = (globalThis as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector!;
  const detector = new Detector({ formats: ['qr_code'] });
  return {
    kind: 'barcode-detector',
    async decode(canvas) {
      try {
        const codes = await detector.detect(canvas);
        const value = codes[0]?.rawValue?.trim();
        return value || null;
      } catch {
        return null;
      }
    },
  };
}

async function createZxingWasmEngine(): Promise<QrDecodeEngine> {
  const { prepareZXingModule, readBarcodes } = await import('zxing-wasm/reader');
  // Vite `public/`에 복사된 reader WASM을 동일 오리진으로 로드(오프라인 PWA·CDN 의존 제거).
  const wasmUrl = `${import.meta.env.BASE_URL}zxing_reader.wasm`;

  prepareZXingModule({
    overrides: {
      locateFile: (path: string, prefix: string) =>
        path.endsWith('.wasm') ? wasmUrl : `${prefix}${path}`,
    },
  });

  return {
    kind: 'zxing-wasm',
    async decode(canvas) {
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context || canvas.width === 0 || canvas.height === 0) return null;
      try {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const results = await readBarcodes(imageData, {
          formats: ['QRCode'],
          tryHarder: true,
          tryRotate: true,
          tryInvert: true,
          maxNumberOfSymbols: 1,
        });
        const value = results[0]?.text?.trim();
        return value || null;
      } catch {
        return null;
      }
    },
  };
}

/** Android BarcodeDetector 우선, 그 외(및 iOS)는 zxing-cpp WASM을 lazy import. */
export async function createQrDecodeEngine(): Promise<QrDecodeEngine> {
  if (await canUseNativeBarcodeDetector()) return createBarcodeDetectorEngine();
  return createZxingWasmEngine();
}
