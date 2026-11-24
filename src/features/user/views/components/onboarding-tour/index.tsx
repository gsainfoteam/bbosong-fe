import { useTranslation } from 'react-i18next';

import { CoachMark } from '@/common/components';
import { type OnboardingStep } from '@/features/user/viewmodels';

import { OnboardingLiveSheet } from '../onboarding-live-sheet';

export function OnboardingTour({
  step,
  position,
  total,
  isLast,
  liveSheet,
  onNext,
  onFinish,
}: OnboardingTour.Props) {
  const { t } = useTranslation('onboarding');

  if (!step) return null;

  if (step === 'live-activity') {
    return (
      <OnboardingLiveSheet {...liveSheet} position={position} total={total} onClose={onFinish} />
    );
  }

  const copy = {
    machines: { title: t('coach.machines.title'), description: t('coach.machines.description') },
    alert: { title: t('coach.alert.title'), description: t('coach.alert.description') },
    register: { title: t('coach.register.title'), description: t('coach.register.description') },
    map: { title: t('coach.map.title'), description: t('coach.map.description') },
  }[step];

  return (
    <CoachMark
      target={step}
      {...copy}
      step={position}
      total={total}
      nextLabel={isLast ? t('done') : t('next')}
      skipLabel={t('skip')}
      onNext={onNext}
      onSkip={onFinish}
    />
  );
}

export namespace OnboardingTour {
  export type Props = {
    step: OnboardingStep | null;
    position: number;
    total: number;
    isLast: boolean;
    liveSheet: Omit<OnboardingLiveSheet.Props, 'position' | 'total' | 'onClose'>;
    onNext: () => void;
    onFinish: () => void;
  };
}
