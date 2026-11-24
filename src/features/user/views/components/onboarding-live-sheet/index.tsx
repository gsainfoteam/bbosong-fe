import { useTranslation } from 'react-i18next';

import { BottomSheet, Button } from '@/common/components';
import { cn } from '@/common/utils';

// 잠금화면 그림. 설명을 돕는 장식이라 스크린 리더에서는 가린다.
function LockScreenArt({ showLiveActivity }: { showLiveActivity: boolean }) {
  const { t } = useTranslation('onboarding');

  return (
    <div
      aria-hidden
      className="rounded-banner flex flex-col gap-2 bg-linear-to-br from-[#3b6f8f] to-[#1d3345] px-4 pt-4 pb-3.5"
    >
      <p className="font-num text-center text-[34px] leading-none font-light text-white">9:41</p>
      {showLiveActivity && (
        <div className="bg-ink/85 rounded-card ring-brand/70 px-3.5 py-3 text-white ring-2">
          <div className="flex items-baseline justify-between text-[13px] font-bold">
            <span>{t('art.running')}</span>
            <span className="font-num">{t('art.remaining')}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
            <div className="bg-brand h-full w-[70%] rounded-full" />
          </div>
        </div>
      )}
      <div className="rounded-tile text-ink-2 bg-white/85 px-3.5 py-2.5 text-[12px] leading-[1.45]">
        <p className="text-ink text-[12.5px] font-bold">{t('art.app')}</p>
        {t('art.done')}
      </div>
    </div>
  );
}

export function OnboardingLiveSheet({
  permission,
  liveActivitySupported,
  isNative,
  isRequesting,
  position,
  total,
  onEnable,
  onClose,
}: OnboardingLiveSheet.Props) {
  const { t } = useTranslation(['onboarding', 'notification']);

  const title = liveActivitySupported ? t('live.title') : t('live.titleUnsupported');

  let description: string;
  if (permission === 'denied') {
    description = isNative
      ? t('notification:permission.deniedNative')
      : t('notification:permission.denied');
  } else if (!liveActivitySupported) {
    description = t('live.descriptionUnsupported');
  } else {
    description = permission === 'granted' ? t('live.descriptionGranted') : t('live.description');
  }

  return (
    <BottomSheet open onClose={onClose} aria-label={title}>
      <LockScreenArt showLiveActivity={liveActivitySupported} />
      <h2 className="mt-5 text-center text-[19px] leading-[1.35] font-extrabold tracking-[-0.025em] text-balance">
        {title}
      </h2>
      <p className="text-ink-2 mt-1.5 text-center text-[13px] leading-[1.6] text-balance">
        {description}
      </p>
      <span
        role="img"
        aria-label={`${position}/${total}`}
        className="mt-5 flex items-center justify-center gap-1.25"
      >
        {Array.from({ length: total }, (_, index) => (
          <i
            key={index}
            className={cn(
              'h-1.5 rounded-full',
              index + 1 === position ? 'bg-brand w-4' : 'bg-line w-1.5',
            )}
          />
        ))}
      </span>
      {permission === 'default' ? (
        <div className="mt-4 flex flex-col items-center gap-1">
          <Button type="button" wide loading={isRequesting} onClick={onEnable}>
            {isRequesting ? t('notification:permission.requesting') : t('live.enable')}
          </Button>
          <Button type="button" variant="text" size="s" onClick={onClose}>
            {t('live.later')}
          </Button>
        </div>
      ) : (
        <Button type="button" wide className="mt-4" onClick={onClose}>
          {t('live.start')}
        </Button>
      )}
    </BottomSheet>
  );
}

export namespace OnboardingLiveSheet {
  export type Props = {
    /** 알림 권한 상태. 설치 전·미지원 환경에서는 이 시트를 보여 주지 않는다. */
    permission: 'default' | 'granted' | 'denied';
    /** 잠금화면 현황(Live Activity/Live Update)을 쓸 수 있는지. 못 쓰면 알림만 안내한다. */
    liveActivitySupported: boolean;
    isNative: boolean;
    isRequesting: boolean;
    position: number;
    total: number;
    /** 알림 권한을 요청한다. 끝나면 온보딩도 마친다. */
    onEnable: () => void;
    /** 권한 요청 없이 온보딩을 마친다. 시트를 밀어 내리거나 바깥을 눌러도 불린다. */
    onClose: () => void;
  };
}
