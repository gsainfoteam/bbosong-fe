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

export function trackEvent<E extends AnalyticsEvent>(
  ...[event, properties]: AnalyticsEventProperties[E] extends undefined
    ? [event: E]
    : [event: E, properties: AnalyticsEventProperties[E]]
) {
  if (!isEnabled) return;

  amplitude.track(event, properties);
}

/** 로그인 사용자를 식별한다. userId에는 이메일·학번 대신 서버 UUID를 쓴다 */
export function identifyAnalyticsUser(userId: string, properties: Record<string, string>) {
  if (!isEnabled) return;

  if (amplitude.getUserId() !== userId) amplitude.setUserId(userId);

  const identify = new amplitude.Identify();
  Object.entries(properties).forEach(([key, value]) => identify.set(key, value));
  amplitude.identify(identify);
}

/** 로그아웃 시 호출해 같은 기기의 다음 사용자 이벤트가 이전 계정에 묶이지 않게 한다 */
export function resetAnalyticsUser() {
  if (!isEnabled) return;

  amplitude.reset();
}
