import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { FirebaseMessaging, Importance } from '@capacitor-firebase/messaging';

import { isNativeApp } from './platform';
import { type PushMessagePayload } from './service-worker';

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

const resumeListeners = new Set<() => void>();

/** 앱이 포그라운드로 돌아오고 권한 캐시 갱신이 끝난 뒤 호출된다. 반환되는 함수로 해제한다 */
export function subscribeToNativeResume(listener: () => void): () => void {
  resumeListeners.add(listener);

  return () => resumeListeners.delete(listener);
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

/** 서버가 보낸 url이 앱 내부 경로일 때만 그대로 돌려주고, 아니면 null (오픈 리다이렉트/외부 스킴 차단) */
export function toSafeAppPath(url: unknown): string | null {
  if (typeof url !== 'string' || !url.startsWith('/')) return null;
  // `//host`, `/\host`는 브라우저가 외부 호스트로 해석한다
  if (url.startsWith('//') || url.startsWith('/\\')) return null;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(url)) return null;

  try {
    const base = 'http://app.invalid';
    if (new URL(url, base).origin !== base) return null;
  } catch {
    return null;
  }

  return url;
}

type NativeNotification = { title?: string; body?: string; data?: unknown };

/**
 * FCM 알림을 Web Push의 `PushMessagePayload` 형태로 맞춘다.
 * FCM data는 `url`, `icon`과 `data`의 각 키가 평탄한 문자열로 오므로 나머지를 `data`로 묶는다.
 */
export function toPushMessagePayload(notification: NativeNotification): PushMessagePayload {
  const raw =
    notification.data && typeof notification.data === 'object'
      ? (notification.data as Record<string, unknown>)
      : {};
  const { url, icon, ...data } = raw;

  return {
    title: notification.title,
    body: notification.body,
    url: typeof url === 'string' ? url : undefined,
    icon: typeof icon === 'string' ? icon : undefined,
    data,
  };
}

/** 앱이 포그라운드일 때 푸시를 받으면 호출된다. 반환되는 함수로 해제한다 */
export function subscribeToNativePushReceived(
  listener: (payload: PushMessagePayload) => void,
): () => void {
  const handle = FirebaseMessaging.addListener('notificationReceived', ({ notification }) =>
    listener(toPushMessagePayload(notification)),
  );

  return () => {
    void handle.then((registered) => registered.remove()).catch(() => {});
  };
}

/**
 * 알림 탭 → 앱 내 경로.
 *
 * 콜드 스타트에서는 탭 이벤트가 라우터 준비보다 먼저 도착하므로, 구독자가 없을 때 온 마지막 경로를
 * 보관했다가 첫 구독 시 한 번 전달한다.
 */
let pendingTapPath: string | null = null;
const tapListeners = new Set<(path: string) => void>();

function handleNotificationTap(notification: NativeNotification): void {
  const path = toSafeAppPath(toPushMessagePayload(notification).url);
  if (!path) return;

  if (tapListeners.size === 0) {
    pendingTapPath = path;
    return;
  }

  tapListeners.forEach((listener) => listener(path));
}

/** 알림 탭으로 이동할 경로를 구독한다. 보관 중인 경로가 있으면 즉시 한 번 전달한다 */
export function subscribeToNativeNotificationTap(listener: (path: string) => void): () => void {
  tapListeners.add(listener);

  if (pendingTapPath) {
    const path = pendingTapPath;
    pendingTapPath = null;
    listener(path);
  }

  return () => tapListeners.delete(listener);
}

let localNotificationId = Date.now() % 2_000_000_000;

/**
 * Android는 앱이 포그라운드일 때 FCM이 시스템 알림을 만들지 않으므로 로컬 알림으로 head-up을 직접 띄운다.
 * (iOS는 capacitor.config.ts의 presentationOptions로 시스템 배너를 띄운다)
 * 탭하면 원격 알림과 같은 경로(`url`)로 이동하도록 data를 extra로 넘긴다.
 */
async function showForegroundNotification(notification: NativeNotification): Promise<void> {
  if (permission !== 'granted') return;
  if (!notification.title && !notification.body) return;

  const { url } = toPushMessagePayload(notification);
  localNotificationId = (localNotificationId + 1) % 2_000_000_000;

  await LocalNotifications.schedule({
    notifications: [
      {
        id: localNotificationId,
        title: notification.title ?? '',
        body: notification.body ?? '',
        channelId: NATIVE_PUSH_ANDROID_CHANNEL_ID,
        extra: { url },
      },
    ],
  });
}

/**
 * 네이티브 푸시 초기 설정. 웹에서는 아무것도 하지 않으며 실패해도 앱 시작을 막지 않는다.
 * - 권한 캐시를 채운다 (첫 렌더가 올바른 상태로 그려지도록 렌더 전에 끝낸다)
 * - Android 알림 채널을 서버가 쓰는 ID로 만든다
 * - 앱 복귀 시 권한을 다시 읽는다 (OS 설정에서 바꾼 경우). 이 리스너는 초기 작업이 실패해도 등록된다
 */
export async function initNativePush(): Promise<void> {
  if (!isNativeApp()) return;

  // 앱 복귀 리스너는 아래 초기 작업의 성공 여부와 무관하게 등록한다.
  // 초기 조회/채널 생성이 실패해도 다음 복귀에서 권한 캐시를 복구할 수 있어야 한다
  void App.addListener('resume', () => {
    void refreshNativeNotificationPermission()
      .catch(() => {})
      .finally(() => resumeListeners.forEach((listener) => listener()));
  });

  // 탭 이벤트는 네이티브가 첫 리스너 등록까지 보관하므로 가능한 한 일찍 등록한다
  void FirebaseMessaging.addListener('notificationActionPerformed', ({ notification }) =>
    handleNotificationTap(notification),
  );

  if (Capacitor.getPlatform() === 'android') {
    void FirebaseMessaging.addListener('notificationReceived', ({ notification }) => {
      void showForegroundNotification(notification).catch((error) =>
        console.error('Failed to show foreground notification.', error),
      );
    });
    void LocalNotifications.addListener('localNotificationActionPerformed', ({ notification }) =>
      handleNotificationTap({ data: notification.extra }),
    );
  }

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
  } catch (error) {
    console.error('Failed to initialize native push.', error);
  }
}
