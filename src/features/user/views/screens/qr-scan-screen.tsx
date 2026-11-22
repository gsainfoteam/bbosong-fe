import { type Ref } from 'react';

import { CameraOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button, TopBar } from '@/common/components';
import { cn } from '@/common/utils';

const CORNERS = [
  'top-[-3px] left-[-3px] rounded-tl-[32px] border-t-4 border-l-4',
  'top-[-3px] right-[-3px] rounded-tr-[32px] border-t-4 border-r-4',
  'bottom-[-3px] left-[-3px] rounded-bl-[32px] border-b-4 border-l-4',
  'right-[-3px] bottom-[-3px] rounded-br-[32px] border-r-4 border-b-4',
];

export function QrScanScreen({
  videoRef,
  isCameraReady = true,
  isCameraError = false,
  onClose,
  className,
}: QrScanScreen.Props) {
  const { t } = useTranslation(['main', 'common']);

  return (
    <div
      className={cn(
        'fixed inset-0 z-40 mx-auto flex max-w-120 flex-col overflow-hidden bg-[#121316] text-white',
        className,
      )}
    >
      {!isCameraError && (
        <>
          <video
            ref={videoRef}
            muted
            playsInline
            className={cn(
              'absolute inset-0 size-full bg-[#2a2c31] object-cover transition-opacity duration-200',
              isCameraReady ? 'opacity-100' : 'opacity-0',
            )}
          />
          <div
            aria-hidden
            className="absolute top-[124px] left-1/2 size-[250px] -translate-x-1/2 rounded-[30px] shadow-[0_0_0_200vmax_rgb(12_13_15/0.62)]"
          >
            {CORNERS.map((corner) => (
              <i key={corner} className={cn('absolute size-11 border-white', corner)} />
            ))}
          </div>
        </>
      )}

      <TopBar
        title={t('common:registerLabel')}
        icon="close"
        onBack={onClose}
        className="relative"
      />

      {isCameraError ? (
        <>
          <div
            role="alert"
            className="relative mt-[154px] flex flex-col items-center px-7 text-center"
          >
            <span className="grid size-18 place-items-center rounded-full bg-white/10">
              <CameraOff size={30} strokeWidth={1.9} aria-hidden />
            </span>
            <h2 className="mt-5.5 text-[20px] font-extrabold tracking-[-0.025em]">
              {t('qrScanCameraErrorTitle')}
            </h2>
            <p className="mt-2.5 text-[14px] leading-[1.6] text-balance text-white/72">
              {t('qrScanCameraError')}
            </p>
          </div>
          <div className="pb-cta mt-auto px-5">
            <Button type="button" variant="inverse" size="l" wide onClick={onClose}>
              {t('common:goBack')}
            </Button>
          </div>
        </>
      ) : (
        <p className="relative mt-[360px] px-6 text-center text-[17px] font-bold tracking-[-0.02em]">
          {t('qrScan')}
        </p>
      )}
    </div>
  );
}

export namespace QrScanScreen {
  export type Props = {
    videoRef: Ref<HTMLVideoElement> | null;
    isCameraReady?: boolean;
    isCameraError?: boolean;
    onClose: () => void;
    className?: string;
  };
}
