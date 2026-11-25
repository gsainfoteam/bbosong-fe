import { Capacitor, registerPlugin } from '@capacitor/core';

import { isNativeApp } from './platform';

/**
 * Live Activity(iOS 잠금화면/Dynamic Island)와 Live Update(Android 16 승격 알림) 네이티브 레이어.
 *
 * 두 플랫폼이 같은 이름(`LiveActivity`)·같은 인터페이스의 플러그인을 구현한다.
 * - iOS: `ios/App/App/LiveActivityPlugin.swift`. 서버가 activity별 push token으로 APNs 갱신을 보낸다.
 * - Android: `android/.../liveupdate/LiveActivityPlugin.java`. activity token이 없으므로 `pushToken`/`activityEnded`
 *   이벤트는 발생하지 않고, 서버의 FCM data 메시지를 `LiveUpdateMessagingService`가 직접 알림으로 만든다.
 *
 * 서버 통신은 포함하지 않는다. (토큰 등록/해제 API는 user feature의 viewmodel 담당)
 */

/** 서버(bbosong-be `LIVE_ACTIVITY_STATES`)가 보내는 상태와 같아야 한다(Android FCM data의 `state`도 같다) */
export type LiveActivityPhase = 'RUNNING' | 'COOLING' | 'PAUSE' | 'DETECTING' | 'END' | 'ERROR';

/**
 * Live Activity에 표시할 내용. 서버가 APNs로 보내는 content-state와 같은 모양이다.
 * 시간은 epoch 초이고, 종료 시각을 모르면 `endsAt`, `remainingMinutes`는 null이다.
 * 건조기는 ThinQ로, 세탁기는 사용자가 남은 시간을 입력했을 때만 값이 있다.
 */
export type LiveActivityContentState = {
  state: LiveActivityPhase;
  endsAt: number | null;
  remainingMinutes: number | null;
  updatedAt: number;
};

/** APNs 환경. Debug 빌드는 SANDBOX, TestFlight/App Store 빌드는 PRODUCTION이다 */
export type LiveActivityEnvironment = 'SANDBOX' | 'PRODUCTION';

/** 기계 종류. 건조기는 ThinQ 남은 시간, 세탁기는 입력한 남은 시간이 있을 때만 카운트다운하고 없으면 경과 시간을 보여준다 */
export type LiveActivityKind = 'WASHER' | 'DRYER';

export type LiveActivityStartOptions = {
  machineUuid: string;
  kind: LiveActivityKind;
  /** "A동 건조기 3번"처럼 화면에 그대로 보여줄 이름 */
  title: string;
  /** 사용 시작 시각(epoch 초). 진행 막대의 시작점이고 세탁기는 종료 시각이 없을 때 경과 시간의 기준이다. activity를 처음 만들 때만 쓰인다 */
  startedAt: number;
} & LiveActivityContentState;

export type LiveActivityPushTokenEvent = {
  machineUuid: string;
  token: string;
  environment: LiveActivityEnvironment;
};

export type LiveActivityEndedEvent = { machineUuid: string };

type ListenerHandle = { remove: () => Promise<void> };

interface LiveActivityPlugin {
  isSupported(): Promise<{ supported: boolean }>;
  start(options: LiveActivityStartOptions): Promise<void>;
  update(options: { machineUuid: string } & LiveActivityContentState): Promise<void>;
  end(options: { machineUuid: string }): Promise<void>;
  addListener(
    event: 'pushToken',
    listener: (event: LiveActivityPushTokenEvent) => void,
  ): Promise<ListenerHandle>;
  addListener(
    event: 'activityEnded',
    listener: (event: LiveActivityEndedEvent) => void,
  ): Promise<ListenerHandle>;
}

const LiveActivity = registerPlugin<LiveActivityPlugin>('LiveActivity');

/**
 * 플러그인이 들어 있는 네이티브 앱에서만 true. 플러그인이 없는 이전 네이티브 빌드와 웹에서는 false라
 * 호출하는 쪽이 따로 분기하지 않아도 된다.
 */
function isAvailable(): boolean {
  return isNativeApp() && Capacitor.isPluginAvailable('LiveActivity');
}

/**
 * Live Activity/Live Update를 쓸 수 있는지.
 * iOS는 16.1+이고 사용자가 설정에서 끄지 않았을 때, Android는 16(API 36)+이고 알림이 켜져 있을 때 true다.
 */
export async function isLiveActivitySupported(): Promise<boolean> {
  if (!isAvailable()) return false;

  try {
    const { supported } = await LiveActivity.isSupported();

    return supported;
  } catch {
    return false;
  }
}

/** 같은 기계의 activity가 이미 있으면 내용만 갱신하고 push token을 다시 내보낸다 */
export async function startLiveActivity(options: LiveActivityStartOptions): Promise<void> {
  if (!isAvailable()) return;

  await LiveActivity.start(options);
}

/** 없는 activity를 갱신하려 해도 성공으로 본다 */
export async function updateLiveActivity(
  options: { machineUuid: string } & LiveActivityContentState,
): Promise<void> {
  if (!isAvailable()) return;

  await LiveActivity.update(options);
}

/** activity를 즉시 제거한다. 없어도 성공으로 보며, 이때는 `activityEnded`가 오지 않는다 */
export async function endLiveActivity(machineUuid: string): Promise<void> {
  if (!isAvailable()) return;

  await LiveActivity.end({ machineUuid });
}

function removeLater(handle: Promise<ListenerHandle>): () => void {
  return () => {
    void handle.then((registered) => registered.remove()).catch(() => {});
  };
}

/** activity의 push token이 발급·갱신될 때마다 호출된다. 반환되는 함수로 해제한다 */
export function subscribeToLiveActivityPushToken(
  listener: (event: LiveActivityPushTokenEvent) => void,
): () => void {
  if (!isAvailable()) return () => {};

  return removeLater(LiveActivity.addListener('pushToken', listener));
}

/** 사용자가 지우거나 시스템이 종료한 activity를 알려준다(`endLiveActivity`로 끝낸 경우는 제외) */
export function subscribeToLiveActivityEnded(
  listener: (event: LiveActivityEndedEvent) => void,
): () => void {
  if (!isAvailable()) return () => {};

  return removeLater(LiveActivity.addListener('activityEnded', listener));
}
