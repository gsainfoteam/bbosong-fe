import { describe, expect, it, vi } from 'vitest';

import {
  calculateQrScanRegion,
  improveQrCameraTrack,
  QR_SCAN_MAX_SCANS_PER_SECOND,
  waitForStableVideoSize,
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
    expect(calculateQrScanRegion({ videoWidth: 0, videoHeight: 0 } as HTMLVideoElement)).toEqual({
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
  it('requests continuous focus when supported', async () => {
    const applyConstraints = vi.fn().mockResolvedValue(undefined);
    const track = {
      getCapabilities: () => ({ focusMode: ['continuous', 'manual'] }),
      applyConstraints,
    };
    const stream = { getVideoTracks: () => [track] } as unknown as MediaStream;

    await improveQrCameraTrack(stream);

    expect(applyConstraints).toHaveBeenCalledWith({
      advanced: [{ focusMode: 'continuous' }],
    });
  });

  it('does not touch constraints when continuous focus is unsupported', async () => {
    const applyConstraints = vi.fn().mockResolvedValue(undefined);
    const track = { getCapabilities: () => ({}), applyConstraints };
    const stream = { getVideoTracks: () => [track] } as unknown as MediaStream;

    await improveQrCameraTrack(stream);
    expect(applyConstraints).not.toHaveBeenCalled();
  });

  it('ignores apply failures', async () => {
    const applyConstraints = vi.fn().mockRejectedValue(new Error('unsupported'));
    const track = { getCapabilities: () => ({ focusMode: ['continuous'] }), applyConstraints };
    const stream = { getVideoTracks: () => [track] } as unknown as MediaStream;

    await expect(improveQrCameraTrack(stream)).resolves.toBeUndefined();
  });
});

describe('waitForStableVideoSize', () => {
  const createVideo = (sizes: [number, number][]) => {
    const video = { videoWidth: 0, videoHeight: 0 };
    let index = 0;
    const nextFrame = vi.fn((callback: () => void) => {
      const [width, height] = sizes[Math.min(index, sizes.length - 1)];
      index += 1;
      video.videoWidth = width;
      video.videoHeight = height;
      queueMicrotask(callback);
    });
    return { video, nextFrame };
  };

  it('waits until the size stays the same for the required frames', async () => {
    const { video, nextFrame } = createVideo([
      [0, 0],
      [1280, 720],
      [720, 1280],
      [720, 1280],
      [720, 1280],
    ]);

    await waitForStableVideoSize(video, { nextFrame, stableFrames: 3 });

    expect(nextFrame).toHaveBeenCalledTimes(5);
    expect(video).toEqual({ videoWidth: 720, videoHeight: 1280 });
  });

  it('gives up after the timeout', async () => {
    vi.useFakeTimers();
    const nextFrame = vi.fn();
    const promise = waitForStableVideoSize(
      { videoWidth: 0, videoHeight: 0 },
      { nextFrame, timeoutMs: 500 },
    );

    vi.advanceTimersByTime(500);
    await expect(promise).resolves.toBeUndefined();
    vi.useRealTimers();
  });

  it('resolves right away when aborted', async () => {
    const controller = new AbortController();
    const promise = waitForStableVideoSize(
      { videoWidth: 0, videoHeight: 0 },
      { nextFrame: vi.fn(), signal: controller.signal },
    );

    controller.abort();
    await expect(promise).resolves.toBeUndefined();
  });
});

describe('QR_SCAN_MAX_SCANS_PER_SECOND', () => {
  it('is at least the previous throttled rate and closer to library default', () => {
    expect(QR_SCAN_MAX_SCANS_PER_SECOND).toBeGreaterThanOrEqual(12);
    expect(QR_SCAN_MAX_SCANS_PER_SECOND).toBeLessThanOrEqual(25);
  });
});
