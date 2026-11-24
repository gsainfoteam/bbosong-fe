import { useEffect, useEffectEvent, useRef, useState } from 'react';

import {
  $api,
  isLiveActivitySupported,
  startLiveActivity,
  subscribeToLiveActivityEnded,
  subscribeToLiveActivityPushToken,
  subscribeToNativeResume,
  updateLiveActivity,
} from '@/common/lib';

import { ApiPaths, LiveActivityEnvironment } from '../models';
import {
  liveActivityTargetKey,
  toLiveActivityContentState,
  toStartedAtSeconds,
  type LiveActivityTarget,
} from './live-activity-state';

/**
 * 사용 중인 세탁기/건조기를 iOS Live Activity(잠금화면/Dynamic Island)로 보여준다.
 *
 * - 대상이 생기거나 내용이 바뀌면 activity를 시작/보정한다. 이후 남은 시간은 OS가 카운트다운하고, 상태 변화는
 *   서버가 APNs로 보낸다. 이를 위해 activity의 push token을 서버에 등록한다(토큰이 바뀌면 다시 등록).
 * - 사용이 끝나 목록에서 사라져도 activity는 "완료"로 남겨 둔다. 사용자가 지우거나 시스템이 종료하면
 *   서버의 토큰도 지운다. 기계 등록 해제(`useUnregisterMachine`)는 activity와 토큰을 직접 정리한다.
 * - 앱이 포그라운드로 돌아오면 목록을 다시 조회하고 모든 대상에 시작을 다시 시도한다. 다른 기기에서 등록했거나
 *   사용자가 지운 activity를 채우기 위해서다. 이미 있는 activity는 내용만 갱신된다.
 * - 이미 끝난 기계는 activity가 남아 있을 때만 "완료"로 갱신하고 새로 만들지 않는다. 지운 완료 activity가 다시 뜨지 않게 한다.
 * - iOS 16.1+ 앱이 아니면 아무것도 하지 않는다.
 */
export function useLiveActivitySync(
  targets: readonly LiveActivityTarget[],
  refetch?: () => Promise<unknown>,
) {
  const [isSupported, setIsSupported] = useState(false);
  const { mutate: registerToken } = $api.useMutation(
    'post',
    ApiPaths.MachineController_registerLiveActivity,
  );
  const { mutate: unregisterToken } = $api.useMutation(
    'delete',
    ApiPaths.MachineController_unregisterLiveActivity,
  );

  useEffect(() => {
    let isActive = true;
    void isLiveActivitySupported().then((supported) => {
      if (isActive) setIsSupported(supported);
    });

    return () => {
      isActive = false;
    };
  }, []);

  // 기계별 마지막으로 등록한 토큰. activity가 끝났을 때 서버에서 지울 토큰을 찾는다
  const registeredTokens = useRef(new Map<string, string>());

  useEffect(() => {
    if (!isSupported) return;

    const offToken = subscribeToLiveActivityPushToken(({ machineUuid, token, environment }) => {
      registeredTokens.current.set(machineUuid, token);
      // 세션이 이미 끝났거나(404) 토큰이 바뀌는 중이면 실패할 수 있다. 다음 토큰/시작 때 다시 등록하므로 무시한다
      registerToken(
        {
          params: { path: { uuid: machineUuid } },
          body: { pushToken: token, environment: LiveActivityEnvironment[environment] },
        },
        { onError: () => {} },
      );
    });
    const offEnded = subscribeToLiveActivityEnded(({ machineUuid }) => {
      const token = registeredTokens.current.get(machineUuid);
      registeredTokens.current.delete(machineUuid);
      if (!token) return;
      unregisterToken(
        { params: { path: { uuid: machineUuid } }, body: { pushToken: token } },
        { onError: () => {} },
      );
    });

    return () => {
      offToken();
      offEnded();
    };
  }, [isSupported, registerToken, unregisterToken]);

  // 내용이 같은 렌더에서는 다시 시작하지 않도록 값 기준 키로 비교한다
  const targetsKey = targets.map(liveActivityTargetKey).join('|');

  // 앱이 포그라운드로 돌아올 때마다 올라간다. 목록 조회가 끝난 뒤 시작을 다시 시도하는 신호다
  const [resumeCount, setResumeCount] = useState(0);
  const refetchOnResume = useEffectEvent(() => refetch?.());

  useEffect(() => {
    if (!isSupported) return undefined;

    return subscribeToNativeResume(() => {
      void Promise.resolve(refetchOnResume())
        .catch(() => {})
        .finally(() => setResumeCount((count) => count + 1));
    });
  }, [isSupported]);

  const startAll = useEffectEvent(() => {
    const now = Date.now();
    targets.forEach((target) => {
      const content = toLiveActivityContentState(target, now);
      // 끝난 기계는 있는 activity만 완료로 바꾼다. 지워진 것을 다시 만들지 않는다
      const request =
        content.state === 'END'
          ? updateLiveActivity({ machineUuid: target.machineUuid, ...content })
          : startLiveActivity({
              machineUuid: target.machineUuid,
              kind: target.kind,
              title: target.title,
              startedAt: toStartedAtSeconds(target.startedAt, now),
              ...content,
            });
      request.catch(() => {
        // 사용자가 설정에서 Live Activity를 껐거나 동시에 너무 많이 떠 있는 경우. 앱 사용에는 영향이 없다
      });
    });
  });

  useEffect(() => {
    if (isSupported) startAll();
  }, [isSupported, targetsKey, resumeCount]);
}
