import type { Ref } from 'react';

import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';

export function QrScanScreen({
  videoRef,
  isCameraError = false,
  className,
  ...props
}: QrScanScreen.Props) {
  const { t } = useTranslation('main');
  return (
    <div
      className={cn(
        className,
        'bg-bg flex h-[80dvh] w-full flex-col items-center rounded-t-[4rem] pt-16',
        'shadow-[0px_4px_10px_10px_rgba(0,0,0,0.1)]',
      )}
      {...props}
    >
      <div className="bg-bg-surface mb-10 aspect-square w-4/5 overflow-hidden">
        <video ref={videoRef} className="size-full object-cover" />
      </div>
      {isCameraError ? (
        <p role="alert" className="text-body-lg px-6 text-center font-medium">
          {t('qrScanCameraError')}
        </p>
      ) : (
        <span className="text-body-lg font-medium">{t('qrScan')}</span>
      )}
    </div>
  );
}

export namespace QrScanScreen {
  export type Props = {
    videoRef: Ref<HTMLVideoElement> | null;
    isCameraError?: boolean;
    className?: string;
  };
}
