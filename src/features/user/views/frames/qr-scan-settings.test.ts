import { describe, expect, it, vi } from 'vitest';

import {
  calculateQrScanRegion,
  improveQrCameraTrack,
  QR_SCAN_MAX_SCANS_PER_SECOND,
  QR_SCAN_TARGET_RESOLUTION,
} from './qr-scan-settings';

describe('calculateQrScanRegion', () => {
  it('uses the full video frame with downscale capped at 720 on the long side', () => {
    expect(
      calculateQrScanRegion({ videoWidth: 1280, videoHeight: 720 } as HTMLVideoElement),
    ).toEqual({
      x: 0,
      y: 0,
      width: 1280,
      height: 720,
      downScaledWidth: 720,
      downScaledHeight: 405,
    });
  });

  it('does not upscale small frames', () => {
    expect(
      calculateQrScanRegion({ videoWidth: 640, videoHeight: 480 } as HTMLVideoElement),
    ).toEqual({
      x: 0,
      y: 0,
      width: 640,
      height: 480,
      downScaledWidth: 640,
      downScaledHeight: 480,
    });
  });

  it('returns a safe empty region when metadata is missing', () => {
    expect(
      calculateQrScanRegion({ videoWidth: 0, videoHeight: 0 } as HTMLVideoElement),
    ).toEqual({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      downScaledWidth: 0,
      downScaledHeight: 0,
    });
  });
});

describe('improveQrCameraTrack', () => {
  it('requests 1280x720 ideal and continuous focus when supported', async () => {
    const applyConstraints = vi.fn().mockResolvedValue(undefined);
    const track = {
      getCapabilities: () => ({ focusMode: ['continuous', 'manual'] }),
      applyConstraints,
    };
    const stream = { getVideoTracks: () => [track] } as unknown as MediaStream;

    await improveQrCameraTrack(stream);

    expect(applyConstraints).toHaveBeenCalledWith({
      width: { ideal: QR_SCAN_TARGET_RESOLUTION.width },
      height: { ideal: QR_SCAN_TARGET_RESOLUTION.height },
      advanced: [{ focusMode: 'continuous' }],
    });
  });

  it('skips focus constraint when unsupported and ignores apply failures', async () => {
    const applyConstraints = vi.fn().mockRejectedValue(new Error('unsupported'));
    const track = {
      getCapabilities: () => ({}),
      applyConstraints,
    };
    const stream = { getVideoTracks: () => [track] } as unknown as MediaStream;

    await expect(improveQrCameraTrack(stream)).resolves.toBeUndefined();
    expect(applyConstraints).toHaveBeenCalledWith({
      width: { ideal: QR_SCAN_TARGET_RESOLUTION.width },
      height: { ideal: QR_SCAN_TARGET_RESOLUTION.height },
    });
  });
});

describe('QR_SCAN_MAX_SCANS_PER_SECOND', () => {
  it('is at least the previous throttled rate and closer to library default', () => {
    expect(QR_SCAN_MAX_SCANS_PER_SECOND).toBeGreaterThanOrEqual(12);
    expect(QR_SCAN_MAX_SCANS_PER_SECOND).toBeLessThanOrEqual(25);
  });
});
