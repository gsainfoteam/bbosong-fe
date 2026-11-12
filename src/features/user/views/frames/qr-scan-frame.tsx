import { useEffect, useRef, useState } from 'react';

import { useNavigate } from '@tanstack/react-router';

import { useResolveMachineShortlink } from '../../viewmodels';
import { QrScanScreen } from '../screens';
import { createQrDecodeEngine } from './qr-decode-engine';
import {
  calculateQrScanRegion,
  QR_SCAN_MAX_SCANS_PER_SECOND,
  startQrCamera,
  stopQrCamera,
} from './qr-scan-settings';

export function QrScanFrame() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const resolveMachineShortlink = useResolveMachineShortlink();
  const [isCameraError, setIsCameraError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const controller = new AbortController();
    const canvas = document.createElement('canvas');
    let isResolving = false;
    let lastScanData: string | null = null;
    let retryAfter = 0;
    let lastScanAt = 0;
    let rafId = 0;

    const scanLoop = async (
      engine: Awaited<ReturnType<typeof createQrDecodeEngine>>,
    ): Promise<void> => {
      if (controller.signal.aborted) return;

      const minIntervalMs = 1000 / QR_SCAN_MAX_SCANS_PER_SECOND;
      const elapsed = Date.now() - lastScanAt;
      if (elapsed < minIntervalMs) {
        rafId = requestAnimationFrame(() => {
          void scanLoop(engine);
        });
        return;
      }
      lastScanAt = Date.now();

      if (!isResolving && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        const region = calculateQrScanRegion(video);
        if (region.downScaledWidth > 0 && region.downScaledHeight > 0) {
          canvas.width = region.downScaledWidth;
          canvas.height = region.downScaledHeight;
          const context = canvas.getContext('2d', { willReadFrequently: true });
          if (context) {
            context.drawImage(
              video,
              region.x,
              region.y,
              region.width,
              region.height,
              0,
              0,
              canvas.width,
              canvas.height,
            );
            const data = await engine.decode(canvas);
            if (data && !controller.signal.aborted) {
              if (!(data === lastScanData && Date.now() < retryAfter) && !isResolving) {
                lastScanData = data;
                isResolving = true;
                try {
                  const machineUuid = await resolveMachineShortlink(data, controller.signal);
                  if (machineUuid && !controller.signal.aborted) {
                    stopQrCamera(video);
                    await navigate({
                      to: '/machine-register/$machineUuid',
                      params: { machineUuid },
                    });
                    return;
                  }
                } finally {
                  retryAfter = Date.now() + 2000;
                  isResolving = false;
                }
              }
            }
          }
        }
      }

      if (!controller.signal.aborted) {
        rafId = requestAnimationFrame(() => {
          void scanLoop(engine);
        });
      }
    };

    void (async () => {
      try {
        await startQrCamera(video);
        if (controller.signal.aborted) return;
        const engine = await createQrDecodeEngine();
        if (controller.signal.aborted) return;
        rafId = requestAnimationFrame(() => {
          void scanLoop(engine);
        });
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        console.error('Failed to start camera.', error);
        stopQrCamera(video);
        setIsCameraError(true);
      }
    })();

    return () => {
      controller.abort();
      cancelAnimationFrame(rafId);
      stopQrCamera(video);
    };
  }, [navigate, resolveMachineShortlink]);

  return <QrScanScreen videoRef={videoRef} isCameraError={isCameraError} />;
}
