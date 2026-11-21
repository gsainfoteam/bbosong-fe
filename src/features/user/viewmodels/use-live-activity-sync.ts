import { useEffect, useEffectEvent, useRef, useState } from 'react';

import {
  $api,
  isLiveActivitySupported,
  startLiveActivity,
  subscribeToLiveActivityEnded,
  subscribeToLiveActivityPushToken,
} from '@/common/lib';

import { ApiPaths, LiveActivityEnvironment } from '../models';
import {
  liveActivityTargetKey,
  toLiveActivityContentState,
  toStartedAtSeconds,
  type LiveActivityTarget,
} from './live-activity-state';

/**
 * 사용 중인 건조기를 iOS Live Activity(잠금화면/Dynamic Island)로 보여준다.
 *
 * - 대상이 생기거나 내용이 바뀌면 activity를 시작/보정한다. 이후 남은 시간은 OS가 카운트다운하고, 상태 변화는
 *   서버가 APNs로 보낸다. 이를 위해 activity의 push token을 서버에 등록한다(토큰이 바뀌면 다시 등록).
 * - 사용이 끝나 목록에서 사라져도 activity는 "완료"로 남겨 둔다. 사용자가 지우거나 시스템이 종료하면
 *   서버의 토큰도 지운다. 기계 등록 해제(`useUnregisterMachine`)는 activity와 토큰을 직접 정리한다.
 * - iOS 16.1+ 앱이 아니면 아무것도 하지 않는다.
 */
export function useLiveActivitySync(targets: readonly LiveActivityTarget[]) {
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

  const startAll = useEffectEvent(() => {
    const now = Date.now();
    targets.forEach((target) => {
      startLiveActivity({
        machineUuid: target.machineUuid,
        title: target.title,
        startedAt: toStartedAtSeconds(target.startedAt, now),
        ...toLiveActivityContentState(target, now),
      }).catch(() => {
        // 사용자가 설정에서 Live Activity를 껐거나 동시에 너무 많이 떠 있는 경우. 앱 사용에는 영향이 없다
      });
    });
  });

  useEffect(() => {
    if (isSupported) startAll();
  }, [isSupported, targetsKey]);
}
