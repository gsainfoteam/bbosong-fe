import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

import {
  AnalyticsEvent,
  canPromptInstall,
  canSubscribeOnThisPlatform,
  deleteNativePushToken,
  getNativeNotificationPermission,
  getNativePushPlatform,
  getNativePushToken,
  getNotificationPermission,
  getPushSubscription,
  isAndroid,
  isAppInstalled,
  isIOS,
  isLiveActivitySupported,
  isNativeApp,
  isPushSupported,
  needsInstall,
  requestNativeNotificationPermission,
  requestNotificationPermission,
  showInstallPrompt,
  subscribeToInstallPromptChange,
  subscribeToNativePermissionChange,
  subscribeToNativeResume,
  subscribeToNativeTokenRefresh,
  subscribeToPush,
  trackEvent,
  unsubscribeFromPush,
} from '@/common/lib';
import { useToken } from '@/features/auth';

import {
  NativePushPlatform,
  registerNativePushDevice,
  registerPushDevice,
  unregisterNativePushDevice,
  unregisterPushDevice,
} from '../models';

/** 알림 권한 UI 상태 */
export type PushPermissionStatus =
  'unsupported' | 'needs-install' | 'default' | 'granted' | 'denied';

/** 네이티브 앱은 OS 권한, 웹은 브라우저 권한을 읽는다 */
function readPermission(): NotificationPermission {
  return isNativeApp() ? getNativeNotificationPermission() : getNotificationPermission();
}

function resolveStatus(permission: NotificationPermission): PushPermissionStatus {
  // 네이티브 앱은 이미 설치된 상태이고 푸시도 항상 지원되므로 권한 값만 본다
  if (isNativeApp()) return permission === 'default' ? 'default' : permission;

  if (!isPushSupported()) {
    // iOS 일반 탭에서는 푸시 API가 없어도 홈 화면에 추가하면 사용할 수 있다.
    return isIOS() && needsInstall() ? 'needs-install' : 'unsupported';
  }

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
  if (isNativeApp()) {
    await syncNativePushDevice();
    return;
  }

  // 재등록은 이미 허용된 구독을 갱신하는 동작이라 설치 강제(정책)의 적용 대상이 아니다.
  // 다만 iOS 일반 탭처럼 구독 자체가 불가능한 환경에서는 subscribe()가 실패하므로 건너뛴다
  if (!canSubscribeOnThisPlatform()) return;
  if (getNotificationPermission() !== 'granted') return;

  const subscription = await subscribeToPush();
  if (!subscription) return;

  await registerPushDevice(subscription);
}

/** 현재 FCM 토큰을 서버에 등록/갱신한다. 토큰도 앱 재설치·복원 등으로 바뀔 수 있어 매번 다시 읽는다 */
async function syncNativePushDevice(): Promise<void> {
  if (getNativeNotificationPermission() !== 'granted') return;

  const token = await getNativePushToken();
  if (!token) return;

  const platform = toNativePushPlatform();
  // Live Update는 Android 앱(API 36+)에서만 그릴 수 있다. 서버는 iOS가 보내도 무시하지만 의미가 없어 보내지 않는다
  const supportsLiveUpdate =
    platform === NativePushPlatform.ANDROID && (await isLiveActivitySupported());

  await registerNativePushDevice(platform, token, supportsLiveUpdate);
}

function toNativePushPlatform(): NativePushPlatform {
  return getNativePushPlatform() === 'ios' ? NativePushPlatform.IOS : NativePushPlatform.ANDROID;
}

/**
 * 서버 등록과 브라우저 구독을 모두 해제한다. (로그아웃 시 사용)
 *
 * 반드시 토큰이 살아 있는 동안 await 해야 한다. 순서가 뒤바뀌면 401로 실패해
 * 그 기기에 이전 계정의 알림이 계속 발송된다.
 * 단, 해제 실패가 로그아웃 자체를 막아서는 안 되므로 예외는 삼킨다.
 */
export async function unregisterPushDeviceFromServer(): Promise<void> {
  if (isNativeApp()) {
    await unregisterNativePushDeviceFromServer();
    return;
  }

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
 * 네이티브 앱의 토큰 해제. 웹과 같은 이유로 토큰이 살아 있는 동안 서버 해제를 먼저 await 하고,
 * 실패해도 로그아웃을 막지 않는다. 마지막에 토큰을 무효화해 이전 계정의 알림이 이 기기로 오지 않게 한다.
 */
async function unregisterNativePushDeviceFromServer(): Promise<void> {
  try {
    const token = await getNativePushToken();
    if (!token) return;

    await unregisterNativePushDevice(token);
  } catch (error) {
    console.error('네이티브 푸시 토큰 해제에 실패했습니다.', error);
  } finally {
    await deleteNativePushToken().catch(() => {});
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

    // 직전 등록이 실패했는지 여부. 네이티브는 앱 복귀 시 실패한 등록만 다시 시도한다
    let failed = false;

    const sync = () => {
      syncPushDevice()
        .then(() => {
          failed = false;
        })
        .catch((error) => {
          failed = true;
          console.error('푸시 디바이스 등록에 실패했습니다.', error);
        });
    };

    sync();

    if (!isNativeApp()) return;

    // 네이티브: FCM이 토큰을 갱신하거나, OS 설정에서 권한을 허용하고 돌아오면 서버 등록을 다시 맞춘다
    const unsubscribeRefresh = subscribeToNativeTokenRefresh(sync);
    const unsubscribePermission = subscribeToNativePermissionChange(sync);
    // 권한이 그대로면 권한 변경 알림이 없고 토큰 갱신도 오지 않으므로, 실패한 등록은 복귀 시점에 재시도한다
    const unsubscribeResume = subscribeToNativeResume(() => {
      if (failed) sync();
    });

    return () => {
      unsubscribeRefresh();
      unsubscribePermission();
      unsubscribeResume();
    };
  }, [token]);
}

/**
 * 알림 권한은 브라우저 전역 상태이므로 훅 인스턴스별 useState로 들고 있으면
 * (예: 권한 카드와 빈 기기 토글이 동시에 떠 있을 때) 한쪽만 갱신되어 서로 어긋난다.
 * 모든 인스턴스가 같은 값을 보도록 외부 스토어로 공유한다.
 */
const permissionListeners = new Set<() => void>();

function emitPermissionChange() {
  permissionListeners.forEach((listener) => listener());
}

function subscribePermission(listener: () => void): () => void {
  permissionListeners.add(listener);
  const unsubscribeInstall = subscribeToInstallPromptChange(listener);
  // 네이티브는 앱 복귀 시 OS 권한을 다시 읽어 캐시가 바뀌면 알려 준다
  const unsubscribeNative = isNativeApp() ? subscribeToNativePermissionChange(listener) : undefined;

  // 브라우저 설정에서 권한을 되돌린 경우를 따라잡기 위해 포커스 복귀 시 재조회
  const handleFocus = () => listener();
  window.addEventListener('focus', handleFocus);

  // 지원 브라우저에서는 설정 변경을 즉시 반영한다 (Safari 등 미지원 시 focus 폴백)
  let permissionStatus: PermissionStatus | null = null;
  navigator.permissions
    ?.query({ name: 'notifications' as PermissionName })
    .then((status) => {
      permissionStatus = status;
      status.addEventListener('change', listener);
    })
    .catch(() => {});

  return () => {
    permissionListeners.delete(listener);
    unsubscribeInstall();
    unsubscribeNative?.();
    window.removeEventListener('focus', handleFocus);
    permissionStatus?.removeEventListener('change', listener);
  };
}

// 문자열 원시값이라 매번 읽어도 참조가 안정적이다
const getPermissionSnapshot = () => readPermission();
const getStatusSnapshot = () => resolveStatus(readPermission());

async function requestNativePermissionAndSync(): Promise<NotificationPermission> {
  const result = await requestNativeNotificationPermission();
  if (result === 'granted') await syncPushDevice();

  return result;
}

/** 알림 권한 상태와 권한 요청 액션 */
export function usePushPermission() {
  const permission = useSyncExternalStore(subscribePermission, getPermissionSnapshot);
  const [isRequesting, setIsRequesting] = useState(false);

  const status = useSyncExternalStore(subscribePermission, getStatusSnapshot);

  /** 사용자가 명시적으로 버튼을 누른 시점에만 호출할 것 */
  const requestPermission = useCallback(async () => {
    if (isNativeApp()) {
      setIsRequesting(true);
      try {
        const result = await requestNativePermissionAndSync();
        emitPermissionChange();
        trackEvent(AnalyticsEvent.PUSH_PERMISSION_REQUESTED, { result });
      } catch (error) {
        console.error('알림 권한 요청에 실패했습니다.', error);
      } finally {
        setIsRequesting(false);
      }

      return;
    }

    // 설치하지 않은 상태에서는 권한 요청 자체를 막는다 (UI에서도 버튼을 숨기지만 이중 방어)
    if (!isPushSupported() || needsInstall()) return;

    setIsRequesting(true);
    try {
      const result = await requestNotificationPermission();
      // 모든 훅 인스턴스가 새 권한 값을 다시 읽도록 알린다
      emitPermissionChange();
      trackEvent(AnalyticsEvent.PUSH_PERMISSION_REQUESTED, { result });

      if (result !== 'granted') return;

      await syncPushDevice();
    } catch (error) {
      console.error('알림 권한 요청에 실패했습니다.', error);
    } finally {
      setIsRequesting(false);
    }
  }, []);

  return { status, permission, isRequesting, requestPermission, isNative: isNativeApp() };
}

/** 설치 직후 또는 설치된 앱 실행 시 알림 설정을 안내한다. 닫으면 이번 마운트에서는 재노출하지 않는다. */
export function usePostInstallPermission() {
  const installed = useSyncExternalStore(subscribeToInstallPromptChange, isAppInstalled);
  const { status } = usePushPermission();
  const [dismissed, setDismissed] = useState(false);

  return {
    isOpen: installed && !dismissed && status !== 'granted' && status !== 'unsupported',
    dismiss: useCallback(() => setDismissed(true), []),
  };
}

/** 앱 설치 유도. Chrome/Edge 계열은 앱 내 버튼으로, iOS Safari는 안내 문구로 처리한다 */
export function useInstallPrompt() {
  const canPrompt = useSyncExternalStore(subscribeToInstallPromptChange, canPromptInstall);
  const [isPrompting, setIsPrompting] = useState(false);
  const [needsManualInstall, setNeedsManualInstall] = useState(false);

  const promptInstall = useCallback(async () => {
    setIsPrompting(true);
    try {
      const outcome = await showInstallPrompt();
      trackEvent(AnalyticsEvent.APP_INSTALL_PROMPTED, { outcome });
      setNeedsManualInstall(outcome !== 'accepted');
    } catch (error) {
      setNeedsManualInstall(true);
      console.error('앱 설치 프롬프트를 띄우지 못했습니다.', error);
    } finally {
      setIsPrompting(false);
    }
  }, []);

  return {
    canPrompt,
    isPrompting,
    promptInstall,
    showManualGuide: !isPrompting && (needsManualInstall || !canPrompt),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
  };
}
