import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { FirebaseMessaging, Importance } from '@capacitor-firebase/messaging';

import { isNativeApp } from './platform';

/**
 * 네이티브 앱(FCM) 푸시 레이어.
 *
 * Web Push용 `service-worker.ts`와 같은 위치에서 같은 역할(권한/토큰)을 맡되, 서버 통신은 포함하지 않는다.
 * (토큰 등록/해제 API는 push-notification feature의 models 담당)
 */

/** 백엔드 `FCM_ANDROID_CHANNEL_ID` 기본값과 같아야 한다. 다르면 Android가 기본(Misc) 채널로 표시한다 */
export const NATIVE_PUSH_ANDROID_CHANNEL_ID = 'default';

export type NativePushPlatform = 'ios' | 'android';

/**
 * 권한 상태 캐시.
 *
 * 네이티브 권한 조회는 비동기지만 UI는 동기 값(useSyncExternalStore)이 필요하므로,
 * 앱 시작(`initNativePush`)·권한 요청·앱 복귀 시점에만 갱신하고 그 값을 동기로 돌려준다.
 */
let permission: NotificationPermission = 'default';
const permissionListeners = new Set<() => void>();

function toNotificationPermission(state: string): NotificationPermission {
  if (state === 'granted') return 'granted';
  if (state === 'denied') return 'denied';

  return 'default';
}

function setPermission(next: NotificationPermission): void {
  if (permission === next) return;

  permission = next;
  permissionListeners.forEach((listener) => listener());
}

/** 현재 네이티브 알림 권한. 아직 조회 전이면 'default' */
export function getNativeNotificationPermission(): NotificationPermission {
  return permission;
}

/** 권한 변경(OS 설정에서 바꾸고 앱으로 돌아온 경우 포함)을 구독한다. 반환되는 함수로 해제한다 */
export function subscribeToNativePermissionChange(listener: () => void): () => void {
  permissionListeners.add(listener);

  return () => permissionListeners.delete(listener);
}

/** OS의 현재 권한을 다시 읽어 캐시에 반영한다 */
export async function refreshNativeNotificationPermission(): Promise<NotificationPermission> {
  const { receive } = await FirebaseMessaging.checkPermissions();
  setPermission(toNotificationPermission(receive));

  return permission;
}

/** 알림 권한을 요청한다. 사용자 제스처 안에서만 호출할 것. 한 번 거부하면 OS 설정에서만 풀 수 있다 */
export async function requestNativeNotificationPermission(): Promise<NotificationPermission> {
  const { receive } = await FirebaseMessaging.requestPermissions();
  setPermission(toNotificationPermission(receive));

  return permission;
}

/** 서버에 등록할 때 쓰는 플랫폼 구분 */
export function getNativePushPlatform(): NativePushPlatform {
  return Capacitor.getPlatform() === 'ios' ? 'ios' : 'android';
}

/** 현재 FCM 등록 토큰. 아직 발급할 수 없으면 null */
export async function getNativePushToken(): Promise<string | null> {
  const { token } = await FirebaseMessaging.getToken();

  return token || null;
}

/** FCM 토큰을 무효화한다. 다음 `getNativePushToken`은 새 토큰을 발급한다 */
export async function deleteNativePushToken(): Promise<void> {
  await FirebaseMessaging.deleteToken();
}

/** FCM이 토큰을 갱신하면 호출된다. 반환되는 함수로 해제한다 */
export function subscribeToNativeTokenRefresh(listener: (token: string) => void): () => void {
  const handle = FirebaseMessaging.addListener('tokenReceived', ({ token }) => listener(token));

  return () => {
    void handle.then((registered) => registered.remove()).catch(() => {});
  };
}

/**
 * 네이티브 푸시 초기 설정. 웹에서는 아무것도 하지 않으며 실패해도 앱 시작을 막지 않는다.
 * - 권한 캐시를 채운다 (첫 렌더가 올바른 상태로 그려지도록 렌더 전에 끝낸다)
 * - Android 알림 채널을 서버가 쓰는 ID로 만든다
 * - 앱 복귀 시 권한을 다시 읽는다 (OS 설정에서 바꾼 경우)
 */
export async function initNativePush(): Promise<void> {
  if (!isNativeApp()) return;

  try {
    await Promise.all([
      refreshNativeNotificationPermission(),
      Capacitor.getPlatform() === 'android'
        ? FirebaseMessaging.createChannel({
            id: NATIVE_PUSH_ANDROID_CHANNEL_ID,
            name: '뽀송',
            importance: Importance.High,
          })
        : Promise.resolve(),
    ]);

    void App.addListener('resume', () => {
      void refreshNativeNotificationPermission().catch(() => {});
    });
  } catch (error) {
    console.error('Failed to initialize native push.', error);
  }
}
