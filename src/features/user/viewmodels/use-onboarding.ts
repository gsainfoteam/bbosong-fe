import { useCallback, useEffect, useState } from 'react';

import { isLiveActivitySupported } from '@/common/lib';

const STORAGE_KEY = 'bbosong:onboarding-completed';

// 이미 열린 시트·다이얼로그가 있으면 그 위에 겹쳐 시작하지 않는다.
const OPEN_DIALOG = '[role="dialog"][data-open], [role="alertdialog"][data-open]';

/** 안내 순서. 마지막을 뺀 앞의 단계는 화면 요소를 짚는 코치마크이고, 마지막은 잠금화면 현황을 소개하는 시트다. */
const ORDER = ['machines', 'alert', 'register', 'map', 'live-activity'] as const;

export type OnboardingStep = (typeof ORDER)[number];

const readCompleted = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    // 저장소를 못 읽으면 본 적 없는 것으로 본다. 한 번 더 보이는 쪽이 아예 못 보는 쪽보다 낫다.
    return false;
  }
};

const writeCompleted = () => {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    // 저장하지 못하면 다음 실행에 다시 보일 뿐이다.
  }
};

/**
 * 첫 실행 온보딩 튜토리얼의 진행 상태.
 *
 * - `available`에서 true인 단계만 순서대로 보여 준다. (알림을 받을 수 없는
 *   환경은 잠금화면 단계를 건너뛴다.)
 * - 끝까지 봤든 건너뛰었든 한 번 끝나면 다시 시작하지 않는다.
 * - `enabled`가 true가 되고 화면에 열린 시트가 없을 때 한 번만 시작한다.
 */
export function useOnboarding({ enabled, available }: UseOnboarding.Options) {
  const [completed, setCompleted] = useState(readCompleted);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [liveActivitySupported, setLiveActivitySupported] = useState(false);

  useEffect(() => {
    let isActive = true;
    void isLiveActivitySupported().then((supported) => {
      if (isActive) setLiveActivitySupported(supported);
    });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled || completed || started) return;
    // 한 프레임 미룬다. 같은 시점에 열리는 시트가 먼저 그려져야 위 검사에 잡힌다.
    const frame = requestAnimationFrame(() => {
      if (!document.querySelector(OPEN_DIALOG)) setStarted(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [enabled, completed, started]);

  const steps = ORDER.filter((id) => available[id]);
  const step = started && !completed ? (steps[index] ?? null) : null;

  const finish = useCallback(() => {
    writeCompleted();
    setCompleted(true);
  }, []);

  const next = useCallback(() => {
    if (index + 1 >= steps.length) finish();
    else setIndex(index + 1);
  }, [index, steps.length, finish]);

  // 진행 중 단계가 사라져(예: 목록이 비어) 더 보여 줄 게 없으면 끝난 것으로 남긴다.
  const exhausted = started && !completed && !step;
  useEffect(() => {
    if (exhausted) writeCompleted();
  }, [exhausted]);

  return {
    step,
    /** 1부터 시작하는 현재 단계 번호 */
    position: index + 1,
    total: steps.length,
    isLast: index + 1 >= steps.length,
    liveActivitySupported,
    next,
    finish,
  };
}

export namespace UseOnboarding {
  export type Options = {
    /** 데이터를 다 불러와 화면이 자리 잡았을 때만 true */
    enabled: boolean;
    available: Record<OnboardingStep, boolean>;
  };
}
