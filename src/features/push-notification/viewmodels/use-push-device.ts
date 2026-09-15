import { useCallback, useEffect, useState } from 'react';

import {
  canPromptInstall,
  canSubscribeOnThisPlatform,
  getNotificationPermission,
  getPushSubscription,
  isIOS,
  isPushSupported,
  needsInstall,
  requestNotificationPermission,
  showInstallPrompt,
  subscribeToInstallPromptChange,
  subscribeToPush,
  unsubscribeFromPush,
} from '@/common/lib';
import { useToken } from '@/features/auth';

import { registerPushDevice, unregisterPushDevice } from '../models';

/** 알림 권한 UI 상태 */
export type PushPermissionStatus =
  'unsupported' | 'needs-install' | 'default' | 'granted' | 'denied';

function resolveStatus(permission: NotificationPermission): PushPermissionStatus {
  if (!isPushSupported()) return 'unsupported';

  // 이미 허용된 사용자는 설치 여부와 무관하게 알림이 동작하므로 설치를 다시 요구하지 않는다.
  // (설치 후 허용해 둔 사용자가 일반 탭으로 들어왔을 때 기능이 잠기는 것을 막는다)
  if (permission === 'granted') return 'granted';

  // 차단은 설치보다 우선하는 블로커다. 설치해도 풀리지 않으므로 해제 안내를 먼저 보여준다
  if (permission === 'denied') return 'denied';

  // 모든 플랫폼에서 설치를 알림 활성화의 선행 조건으로 강제한다
  if (needsInstall()) return 'needs-install';

  return 'default';
}

/**
 * 현재 브라우저 구독을 서버에 등록/갱신한다.
 *
 * endpoint는 푸시 서비스(FCM/Mozilla/Apple)가 발급하는 값이라 구독 만료, 사이트 데이터 삭제,
 * PWA 재설치, 권한 재허용 등으로 예고 없이 바뀐다. API가 멱등하므로
 * 앱 실행 시점과 로그인 직후마다 호출해 endpoint 변경을 조용히 흡수한다.
 */
export async function syncPushDevice(): Promise<void> {
  // 재등록은 이미 허용된 구독을 갱신하는 동작이라 설치 강제(정책)의 적용 대상이 아니다.
  // 다만 iOS 일반 탭처럼 구독 자체가 불가능한 환경에서는 subscribe()가 실패하므로 건너뛴다
  if (!canSubscribeOnThisPlatform()) return;
  if (getNotificationPermission() !== 'granted') return;

  const subscription = await subscribeToPush();
  if (!subscription) return;

  await registerPushDevice(subscription);
}

/**
 * 서버 등록과 브라우저 구독을 모두 해제한다. (로그아웃 시 사용)
 *
 * 반드시 토큰이 살아 있는 동안 await 해야 한다. 순서가 뒤바뀌면 401로 실패해
 * 그 기기에 이전 계정의 알림이 계속 발송된다.
 * 단, 해제 실패가 로그아웃 자체를 막아서는 안 되므로 예외는 삼킨다.
 */
export async function unregisterPushDeviceFromServer(): Promise<void> {
  if (!isPushSupported()) return;

  try {
    const subscription = await getPushSubscription();
    if (!subscription) return;

    await unregisterPushDevice(subscription.endpoint);
  } catch (error) {
    console.error('푸시 구독 해제에 실패했습니다.', error);
  } finally {
    await unsubscribeFromPush().catch(() => {});
  }
}

/**
 * 앱 전역에서 한 번만 마운트해 재등록을 담당하는 훅.
 *
 * 토큰을 의존성으로 두어 앱 실행 시점뿐 아니라 로그인 직후(계정 전환 포함)에도 다시 호출된다.
 * 구독은 브라우저 단위, 등록은 유저 단위이므로 계정이 바뀌면 다시 묶어 주어야 한다.
 */
export function usePushDeviceSync(): void {
  const { token } = useToken();

  useEffect(() => {
    if (!token) return;

    syncPushDevice().catch((error) => {
      console.error('푸시 디바이스 등록에 실패했습니다.', error);
    });
  }, [token]);
}

/** 알림 권한 상태와 권한 요청 액션 */
export function usePushPermission() {
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermission);
  const [isRequesting, setIsRequesting] = useState(false);

  const status = resolveStatus(permission);

  // 브라우저 설정에서 권한을 되돌린 경우를 따라잡기 위해 포커스 복귀 시 재조회
  useEffect(() => {
    const syncPermission = () => setPermission(getNotificationPermission());

    window.addEventListener('focus', syncPermission);
    return () => window.removeEventListener('focus', syncPermission);
  }, []);

  /** 사용자가 명시적으로 버튼을 누른 시점에만 호출할 것 */
  const requestPermission = useCallback(async () => {
    // 설치하지 않은 상태에서는 권한 요청 자체를 막는다 (UI에서도 버튼을 숨기지만 이중 방어)
    if (!isPushSupported() || needsInstall()) return;

    setIsRequesting(true);
    try {
      const result = await requestNotificationPermission();
      setPermission(result);

      if (result !== 'granted') return;

      await syncPushDevice();
    } catch (error) {
      console.error('알림 권한 요청에 실패했습니다.', error);
    } finally {
      setIsRequesting(false);
    }
  }, []);

  return { status, permission, isRequesting, requestPermission };
}

/** 앱 설치 유도. Chrome/Edge 계열은 앱 내 버튼으로, iOS Safari는 안내 문구로 처리한다 */
export function useInstallPrompt() {
  const [canPrompt, setCanPrompt] = useState(canPromptInstall);
  const [isPrompting, setIsPrompting] = useState(false);

  // beforeinstallprompt는 React 마운트 전에 발화할 수 있어 main.tsx에서 미리 잡아 둔다.
  // 여기서는 그 보관 상태의 변화만 구독한다
  useEffect(() => subscribeToInstallPromptChange(() => setCanPrompt(canPromptInstall())), []);

  const promptInstall = useCallback(async () => {
    setIsPrompting(true);
    try {
      await showInstallPrompt();
    } catch (error) {
      console.error('앱 설치 프롬프트를 띄우지 못했습니다.', error);
    } finally {
      setIsPrompting(false);
    }
  }, []);

  return { canPrompt, isPrompting, promptInstall, isIOS: isIOS() };
}
