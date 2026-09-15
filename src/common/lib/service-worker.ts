/**
 * Service Worker / Web Push 브라우저 레이어.
 *
 * 서버 통신은 포함하지 않는다. (푸시 구독 등록/해제 API는 push-notification feature의 models 담당)
 */

const SERVICE_WORKER_URL = '/sw.js';
const SERVICE_WORKER_SCOPE = '/';

/** SW가 푸시 수신 시 앱 클라이언트로 보내는 메시지 타입 (public/sw.js와 동일 문자열 유지) */
export const PUSH_RECEIVED_MESSAGE = 'push-received';

export type PushMessagePayload = {
  title?: string;
  body?: string;
  url?: string;
  icon?: string;
  data?: Record<string, unknown>;
};

/** SW → 클라이언트 postMessage 페이로드 */
export type PushReceivedMessage = {
  type: typeof PUSH_RECEIVED_MESSAGE;
  payload?: PushMessagePayload;
};

/** 브라우저가 Web Push에 필요한 API를 모두 제공하는지 여부 */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/** iOS(iPadOS 데스크톱 모드 포함) 여부 */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;

  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS 13+ 는 UA를 MacIntel로 보고하므로 터치 포인트 수로 구분한다
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/** 홈 화면에 설치된 PWA로 실행 중인지 여부 */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/**
 * 알림을 켜기 전에 앱 설치가 필요한지 여부.
 *
 * iOS Safari는 홈 화면에 추가된 PWA(16.4+)에서만 푸시 구독이 **가능**하다는 플랫폼 제약이 있고,
 * 나머지 플랫폼은 일반 탭에서도 구독이 가능하지만 브라우저가 완전히 종료되면 알림을 놓친다.
 * 수신 안정성을 위해 모든 플랫폼에서 설치를 선행 조건으로 강제한다. (제품 정책)
 */
export function needsInstall(): boolean {
  return !isStandalone();
}

/** 이 플랫폼에서 지금 푸시 구독이 기술적으로 가능한지 여부 (정책이 아닌 브라우저 제약) */
export function canSubscribeOnThisPlatform(): boolean {
  if (!isPushSupported()) return false;

  // iOS는 standalone이 아니면 subscribe() 자체가 실패한다
  return !(isIOS() && !isStandalone());
}

/** Chrome/Edge 계열이 발화하는 설치 프롬프트 이벤트 (표준화 전이라 직접 선언) */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
const installPromptListeners = new Set<() => void>();

function emitInstallPromptChange() {
  installPromptListeners.forEach((listener) => listener());
}

/**
 * 설치 프롬프트 이벤트를 가로채 보관한다.
 *
 * beforeinstallprompt는 페이지 로드 직후 한 번만 발화하므로 React 마운트 전,
 * 즉 main.tsx에서 최대한 이르게 호출해야 이벤트를 놓치지 않는다.
 */
export function initInstallPromptCapture(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('beforeinstallprompt', (event) => {
    // preventDefault를 해야 나중에 우리가 원하는 시점에 prompt()를 띄울 수 있다
    event.preventDefault();
    deferredInstallPrompt = event as BeforeInstallPromptEvent;
    emitInstallPromptChange();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    emitInstallPromptChange();
  });
}

/** 앱 내 설치 버튼을 띄울 수 있는 상태인지 (iOS Safari는 항상 false) */
export function canPromptInstall(): boolean {
  return deferredInstallPrompt !== null;
}

/** 보관해 둔 설치 프롬프트를 띄운다 */
export async function showInstallPrompt(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredInstallPrompt) return 'unavailable';

  await deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;

  // 프롬프트는 1회용이라 사용 후 반드시 버려야 한다
  deferredInstallPrompt = null;
  emitInstallPromptChange();

  return outcome;
}

/** 설치 프롬프트 가용 여부 변화를 구독한다. 반환되는 함수로 해제한다 */
export function subscribeToInstallPromptChange(listener: () => void): () => void {
  installPromptListeners.add(listener);

  return () => installPromptListeners.delete(listener);
}

/** 현재 알림 권한 상태. 미지원 브라우저에서는 'default' 취급 */
export function getNotificationPermission(): NotificationPermission {
  if (!isPushSupported()) return 'default';

  return Notification.permission;
}

/** VAPID 공개키(base64url) → applicationServerKey용 Uint8Array */
export function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);

  // applicationServerKey는 SharedArrayBuffer 기반 뷰를 받지 않으므로 ArrayBuffer로 명시 생성한다
  const output = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let index = 0; index < rawData.length; index += 1) {
    output[index] = rawData.charCodeAt(index);
  }

  return output;
}

/** SW 등록. 미지원 환경에서는 null을 반환한다 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;

  try {
    return await navigator.serviceWorker.register(SERVICE_WORKER_URL, {
      scope: SERVICE_WORKER_SCOPE,
    });
  } catch (error) {
    console.error('Service Worker 등록에 실패했습니다.', error);
    return null;
  }
}

/** 활성화된 SW 등록 객체를 가져온다 (등록되어 있지 않으면 등록을 시도) */
async function getReadyRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;

  const registration = (await navigator.serviceWorker.getRegistration(SERVICE_WORKER_SCOPE))
    ? await navigator.serviceWorker.ready
    : await registerServiceWorker();

  return registration ?? null;
}

/** 현재 브라우저에 남아 있는 푸시 구독을 조회한다 */
export async function getPushSubscription(): Promise<PushSubscription | null> {
  const registration = await getReadyRegistration();
  if (!registration) return null;

  return registration.pushManager.getSubscription();
}

/**
 * 푸시 구독을 확보한다. 기존 구독이 있으면 재사용한다.
 *
 * TODO: VAPID 키를 교체하게 되면 기존 구독이 옛 키에 묶여 있어 발송이 조용히 실패한다.
 *       키 교체 계획이 생기면 `subscription.options.applicationServerKey`를 현재 키와 비교해
 *       다르면 `unsubscribe()` 후 재구독하는 분기를 추가할 것. (신규 구축이므로 현재는 불필요)
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  const registration = await getReadyRegistration();
  if (!registration) return null;

  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;

  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    console.error('VITE_VAPID_PUBLIC_KEY가 설정되어 있지 않아 푸시를 구독할 수 없습니다.');
    return null;
  }

  return registration.pushManager.subscribe({
    // Chrome은 이 값 없이는 구독을 거부한다
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });
}

/** 브라우저의 푸시 구독을 해제한다 */
export async function unsubscribeFromPush(): Promise<void> {
  const subscription = await getPushSubscription();

  await subscription?.unsubscribe();
}

/** 알림 권한을 요청한다. 반드시 사용자 제스처(클릭) 안에서만 호출할 것 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) return 'denied';

  return Notification.requestPermission();
}

/** SW의 푸시 수신 메시지를 구독한다. 반환되는 함수로 해제한다 */
export function subscribeToPushMessages(
  listener: (payload: PushMessagePayload | undefined) => void,
): () => void {
  if (!isPushSupported()) return () => {};

  const handleMessage = (event: MessageEvent<PushReceivedMessage>) => {
    if (event.data?.type !== PUSH_RECEIVED_MESSAGE) return;

    listener(event.data.payload);
  };

  navigator.serviceWorker.addEventListener('message', handleMessage);

  return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
}
