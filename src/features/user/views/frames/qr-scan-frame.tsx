import { useEffect, useRef, useState } from 'react';

import { useNavigate } from '@tanstack/react-router';

import QrScanner from 'qr-scanner';

import { useResolveMachineShortlink } from '../../viewmodels';
import { QrScanScreen } from '../screens';

export function QrScanFrame() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const resolveMachineShortlink = useResolveMachineShortlink();
  const [isCameraError, setIsCameraError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const controller = new AbortController();
    let isResolving = false;
    let lastScanData: string | null = null;
    let retryAfter = 0;

    const scanner = new QrScanner(
      video,
      async ({ data }) => {
        if (isResolving || controller.signal.aborted) return;
        if (data === lastScanData && Date.now() < retryAfter) return;
        lastScanData = data;
        isResolving = true;
        try {
          const machineUuid = await resolveMachineShortlink(data, controller.signal);
          if (!machineUuid || controller.signal.aborted) return;

          scanner.stop();
          await navigate({
            to: '/machine-register/$machineUuid',
            params: { machineUuid },
          });
        } finally {
          retryAfter = Date.now() + 2000;
          isResolving = false;
        }
      },
      {
        preferredCamera: 'environment',
        maxScansPerSecond: 5,
        returnDetailedScanResult: true,
      },
    );

    scanner.start().catch((error: unknown) => {
      if (controller.signal.aborted) return;
      console.error('Failed to start camera.', error);
      if (video.srcObject instanceof MediaStream) {
        video.srcObject.getTracks().forEach((track) => track.stop());
      }
      video.srcObject = null;
      setIsCameraError(true);
    });

    return () => {
      controller.abort();
      scanner.destroy();
    };
  }, [navigate, resolveMachineShortlink]);

  return <QrScanScreen videoRef={videoRef} isCameraError={isCameraError} />;
}
