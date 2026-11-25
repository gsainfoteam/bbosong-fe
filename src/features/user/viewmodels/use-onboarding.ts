import { useCallback, useEffect, useState } from 'react';

import { isLiveActivitySupported } from '@/common/lib';

/** 사용자가 이미 본 튜토리얼 단계의 id 목록(JSON 배열). 단계가 새로 생기면 그 단계만 다시 보여 주기 위해 단계별로 남긴다. */
const STORAGE_KEY = 'bbosong:onboarding-seen';

// 이미 열린 시트·다이얼로그가 있으면 그 위에 겹쳐 시작하지 않는다.
const OPEN_DIALOG = '[role="dialog"][data-open], [role="alertdialog"][data-open]';

/** 안내 순서. 마지막을 뺀 앞의 단계는 화면 요소를 짚는 코치마크이고, 마지막은 잠금화면 현황을 소개하는 시트다. */
const ORDER = ['machines', 'alert', 'register', 'washer-time', 'map', 'live-activity'] as const;

export type OnboardingStep = (typeof ORDER)[number];

const isStep = (value: unknown): value is OnboardingStep => ORDER.some((step) => step === value);

const readSeen = (): OnboardingStep[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isStep) : [];
  } catch {
    // 저장소를 못 읽거나 값이 깨졌으면 본 적 없는 것으로 본다. 한 번 더 보이는 쪽이 아예 못 보는 쪽보다 낫다.
    return [];
  }
};

const writeSeen = (seen: OnboardingStep[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seen));
  } catch {
    // 저장하지 못하면 다음 실행에 다시 보일 뿐이다.
  }
};

/**
 * 온보딩 튜토리얼의 진행 상태.
 *
 * - 시작할 때 `available`이 true이면서 아직 안 본 단계만 모아 순서대로 보여 준다. 그 목록은 시작 시점에 고정해서,
 *   도중에 목록이 바뀌어도(기기 상태 갱신 등) 단계가 밀리거나 끼어들지 않는다.
 * - 본 단계는 넘어갈 때마다 기록한다. 건너뛰거나 닫으면 남은 단계도 본 것으로 친다.
 * - 나중에 단계가 추가되거나, 그때 못 보여 준 단계(예: 빈 자리가 없을 때만 있는 알림 버튼)가 보일 수 있게 되면
 *   다음 실행에서 그 단계만 보여 준다.
 * - `enabled`가 true가 되고 화면에 열린 시트가 없을 때 한 번만 시작한다.
 */
export function useOnboarding({ enabled, available }: UseOnboarding.Options) {
  const [seen, setSeen] = useState(readSeen);
  const [queue, setQueue] = useState<OnboardingStep[] | null>(null);
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

  // 객체는 렌더마다 새로 만들어지므로, 효과가 불필요하게 다시 돌지 않게 문자열로 줄여 비교한다.
  const availableKey = ORDER.filter((step) => available[step]).join(',');

  useEffect(() => {
    if (!enabled || queue) return;
    // 한 프레임 미룬다. 같은 시점에 열리는 시트가 먼저 그려져야 위 검사에 잡힌다.
    const frame = requestAnimationFrame(() => {
      if (document.querySelector(OPEN_DIALOG)) return;
      setQueue(
        ORDER.filter((step) => availableKey.split(',').includes(step) && !seen.includes(step)),
      );
    });

    return () => cancelAnimationFrame(frame);
  }, [enabled, queue, availableKey, seen]);

  const markSeen = useCallback((steps: readonly OnboardingStep[]) => {
    setSeen((current) => {
      const next = [...new Set([...current, ...steps])];
      writeSeen(next);
      return next;
    });
  }, []);

  const total = queue?.length ?? 0;
  const step = queue?.[index] ?? null;

  const next = useCallback(() => {
    if (step) markSeen([step]);
    setIndex(index + 1);
  }, [step, index, markSeen]);

  const finish = useCallback(() => {
    markSeen(queue ?? []);
    setIndex(total);
  }, [queue, total, markSeen]);

  return {
    step,
    /** 1부터 시작하는 현재 단계 번호 */
    position: index + 1,
    total,
    isLast: index + 1 >= total,
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
