import * as amplitude from '@amplitude/analytics-browser';

const amplitudeApiKey = import.meta.env.VITE_AMPLITUDE_API_KEY;

// 키가 없는 환경(로컬, 스테이징, 테스트)에서는 호출을 모두 무시한다.
// init 전에 호출하면 SDK가 이벤트를 메모리 큐에 계속 쌓아 두기 때문이다.
const isEnabled = !!amplitudeApiKey;

// 이메일·카드번호는 SDK가 기본으로 마스킹한다.
// 학번(8자리)과 링크 href에 URL 인코딩되어 들어간 이메일 쿼리는 기본 패턴에 걸리지 않아 추가한다.
const maskTextRegex = [/\b\d{8}\b/g, /email=[^&#]*/gi];

if (isEnabled) {
  amplitude.init(amplitudeApiKey, {
    autocapture: {
      attribution: true,
      fileDownloads: true,
      formInteractions: true,
      pageViews: true,
      sessions: true,
      networkTracking: true,
      webVitals: true,
      elementInteractions: { maskTextRegex },
      frustrationInteractions: { maskTextRegex },
    },
    logLevel: amplitude.Types.LogLevel.Warn,
  });
}

export const AnalyticsEvent = {
  LOGIN_COMPLETED: 'Login Completed',
  LOGOUT_COMPLETED: 'Logout Completed',
  MACHINE_REGISTERED: 'Machine Registered',
  MACHINE_UNREGISTERED: 'Machine Unregistered',
  PUSH_PERMISSION_REQUESTED: 'Push Permission Requested',
  LAUNDRY_ROOM_ALERT_TOGGLED: 'Laundry Room Alert Toggled',
  APP_INSTALL_PROMPTED: 'App Install Prompted',
} as const;

export type AnalyticsEvent = (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

/** 이벤트별 속성 스키마. 개인을 특정할 수 있는 값(이름, 이메일, 학번)은 넣지 않는다 */
export type AnalyticsEventProperties = {
  [AnalyticsEvent.LOGIN_COMPLETED]: undefined;
  [AnalyticsEvent.LOGOUT_COMPLETED]: undefined;
  [AnalyticsEvent.MACHINE_REGISTERED]: { machineUuid: string; completionConfirmed: boolean };
  [AnalyticsEvent.MACHINE_UNREGISTERED]: { machineUuid: string };
  [AnalyticsEvent.PUSH_PERMISSION_REQUESTED]: { result: NotificationPermission };
  [AnalyticsEvent.LAUNDRY_ROOM_ALERT_TOGGLED]: {
    location: string;
    gender: string;
    type: string;
    enabled: boolean;
  };
  [AnalyticsEvent.APP_INSTALL_PROMPTED]: { outcome: 'accepted' | 'dismissed' | 'unavailable' };
};

type AnalyticsEventWithoutProperties = {
  [E in AnalyticsEvent]: AnalyticsEventProperties[E] extends undefined ? E : never;
}[AnalyticsEvent];

export function trackEvent<E extends AnalyticsEvent>(
  ...[event, properties]: AnalyticsEventProperties[E] extends undefined
    ? [event: E]
    : [event: E, properties: AnalyticsEventProperties[E]]
) {
  if (!isEnabled) return;

  amplitude.track(event, properties);
}

let isLoginPending = false;

/**
 * 로그인 성공을 표시해 두고, 사용자 식별이 끝난 뒤 로그인 이벤트를 보낸다.
 *
 * 로그인 응답에는 사용자 UUID가 없어 내 정보 조회 후에야 식별할 수 있다.
 * 바로 기록하면 로그아웃(reset) 후 재로그인한 이벤트가 익명 사용자로 집계된다.
 */
export function markLoginCompleted() {
  if (!isEnabled) return;

  isLoginPending = true;
}

/** 로그인 사용자를 식별한다. userId에는 이메일·학번 대신 서버 UUID를 쓴다 */
export function identifyAnalyticsUser(userId: string, properties: Record<string, string>) {
  if (!isEnabled) return;

  if (amplitude.getUserId() !== userId) amplitude.setUserId(userId);

  const identify = new amplitude.Identify();
  Object.entries(properties).forEach(([key, value]) => identify.set(key, value));
  amplitude.identify(identify);

  if (isLoginPending) {
    isLoginPending = false;
    amplitude.track(AnalyticsEvent.LOGIN_COMPLETED);
  }
}

/**
 * 같은 기기의 다음 이벤트가 이전 계정에 묶이지 않도록 식별을 해제한다.
 *
 * 식별된 사용자가 없으면 건너뛴다. reset은 기기 ID도 새로 만들기 때문에
 * 비로그인 상태에서 반복 호출하면 방문할 때마다 다른 기기로 집계된다.
 *
 * @param lastEvent 해제 직전 사용자에게 귀속시킬 이벤트 (예: 로그아웃)
 */
export function resetAnalyticsUser(lastEvent?: AnalyticsEventWithoutProperties) {
  if (!isEnabled) return;

  const userId = amplitude.getUserId();
  if (!userId) return;

  // track은 user_id·device_id를 비동기 처리 시점에 채우므로, 바로 reset하면 초기화된 값이 들어간다.
  // reset 전 식별 정보를 이벤트 옵션으로 직접 실어 보낸다.
  if (lastEvent) {
    amplitude.track(lastEvent, undefined, { user_id: userId, device_id: amplitude.getDeviceId() });
  }
  amplitude.reset();
}
