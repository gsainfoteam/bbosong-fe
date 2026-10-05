import { useEffect, useRef } from 'react';

import { useNavigate } from '@tanstack/react-router';

import QrScanner from 'qr-scanner';

import { QrScanScreen } from '../screens';

// QR 내용이 URL이면 마지막 경로 세그먼트를, 아니면 원문을 기기 UUID로 사용
const parseMachineUuid = (data: string) => {
  try {
    return new URL(data).pathname.split('/').findLast(Boolean) ?? null;
  } catch {
    return data.trim() || null;
  }
};

export function QrScanFrame() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const scanner = new QrScanner(
      video,
      ({ data }) => {
        const machineUuid = parseMachineUuid(data);
        if (!machineUuid) return;

        scanner.stop();
        void navigate({
          to: '/machine-register/$machineUuid',
          params: { machineUuid },
        });
      },
      {
        preferredCamera: 'environment',
        maxScansPerSecond: 5,
        returnDetailedScanResult: true,
      },
    );

    scanner.start().catch((error: unknown) => {
      console.error('카메라를 시작할 수 없습니다.', error);
    });

    return () => {
      scanner.destroy();
    };
  }, [navigate]);

  return <QrScanScreen videoRef={videoRef} />;
}
