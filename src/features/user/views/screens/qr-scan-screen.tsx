import { cn } from '@/common/utils';
import { useTranslation } from 'react-i18next';
import type { Ref } from 'react';

export function QrScanScreen({ videoRef, className, ...props }: QrScanScreen.Props) {
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
      <div className="w-4/5 bg-bg-surface mb-10 aspect-square">
        <video ref={videoRef} className='w-full' />
      </div>
      <span className='text-body-lg font-medium'>{t('qrScan')}</span>
    </div>
  );
}

export namespace QrScanScreen {
  export type Props = {
    videoRef: Ref<HTMLVideoElement> | null;
    className?: string;
  };
}
