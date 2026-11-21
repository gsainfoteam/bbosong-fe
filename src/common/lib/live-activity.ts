import { Capacitor, registerPlugin } from '@capacitor/core';

import { isNativeApp } from './platform';

/**
 * iOS Live Activity(잠금화면/Dynamic Island) 네이티브 레이어.
 *
 * 구현은 `ios/App/App/LiveActivityPlugin.swift`(앱 내 플러그인)이고, 서버 통신은 포함하지 않는다.
 * (토큰 등록/해제 API는 user feature의 viewmodel 담당)
 */

/** 서버(bbosong-be `LIVE_ACTIVITY_STATES`)가 보내는 상태와 같아야 한다 */
export type LiveActivityPhase = 'RUNNING' | 'COOLING' | 'PAUSE' | 'DETECTING' | 'END' | 'ERROR';

/**
 * Live Activity에 표시할 내용. 서버가 APNs로 보내는 content-state와 같은 모양이다.
 * 시간은 epoch 초이고, 남은 시간을 모르면 `endsAt`, `remainingMinutes`는 null이다.
 */
export type LiveActivityContentState = {
  state: LiveActivityPhase;
  endsAt: number | null;
  remainingMinutes: number | null;
  updatedAt: number;
};

/** APNs 환경. Debug 빌드는 SANDBOX, TestFlight/App Store 빌드는 PRODUCTION이다 */
export type LiveActivityEnvironment = 'SANDBOX' | 'PRODUCTION';

/** 기계 종류. 건조기만 남은 시간을 알고, 세탁기는 경과 시간을 보여준다 */
export type LiveActivityKind = 'WASHER' | 'DRYER';

export type LiveActivityStartOptions = {
  machineUuid: string;
  kind: LiveActivityKind;
  /** "A동 건조기 3번"처럼 화면에 그대로 보여줄 이름 */
  title: string;
  /** 사용 시작 시각(epoch 초). 건조기는 진행 막대의 시작점, 세탁기는 경과 시간의 기준이며 activity를 처음 만들 때만 쓰인다 */
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
 * 플러그인이 들어 있는 iOS 앱에서만 true. 플러그인이 없는 이전 네이티브 빌드와 웹/Android에서는 false라
 * 호출하는 쪽이 따로 분기하지 않아도 된다.
 */
function isAvailable(): boolean {
  return (
    isNativeApp() &&
    Capacitor.getPlatform() === 'ios' &&
    Capacitor.isPluginAvailable('LiveActivity')
  );
}

/** Live Activity를 쓸 수 있는지(iOS 16.1+이고 사용자가 설정에서 끄지 않았는지) */
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
