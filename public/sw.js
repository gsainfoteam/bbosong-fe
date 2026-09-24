// public/ 하위 파일은 Vite 번들링/트랜스파일 대상이 아니므로 순수 JS로만 작성한다.
// (@/ alias, npm import, TS 문법 사용 불가)

const DEFAULT_URL = '/machine';
const ICON_URL = '/icon-192.png';
const BADGE_URL = '/icons/badge-72.png';

// 앱 클라이언트로 푸시 수신을 알릴 때 사용하는 메시지 타입
const PUSH_RECEIVED_MESSAGE = 'push-received';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 일부 브라우저는 fetch 핸들러를 가진 SW만 '설치 가능'으로 판정한다.
// 아직 캐싱 전략이 없으므로 요청을 가로채지 않고 브라우저 기본 동작에 맡긴다.
self.addEventListener('fetch', () => {});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    // 서버가 JSON이 아닌 평문을 보내는 경우에 대한 폴백
    payload = { body: event.data.text() };
  }

  const { title = '뽀송', body = '', url = DEFAULT_URL, icon, data = {} } = payload ?? {};

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, {
        body,
        icon: icon || ICON_URL,
        badge: BADGE_URL,
        data: { ...data, url: url || DEFAULT_URL },
      }),
      notifyClients(payload),
    ]),
  );
});

// 열려 있는 앱 탭에 푸시 수신 사실을 전달한다.
// 빈 기기 알림은 발송 시점에 서버가 해당 구독을 자동 삭제하므로,
// 앱이 켜져 있다면 로컬 토글 상태를 서버와 맞춰 주어야 한다.
async function notifyClients(payload) {
  const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });

  for (const client of clientList) {
    client.postMessage({ type: PUSH_RECEIVED_MESSAGE, payload });
  }
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || DEFAULT_URL;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          // navigate 미지원 브라우저(구형 Safari 등)에서도 최소한 포커스는 되도록 방어
          if ('navigate' in client) {
            return client.navigate(targetUrl).then((navigated) => (navigated || client).focus());
          }
          return client.focus();
        }
      }

      return self.clients.openWindow(targetUrl);
    }),
  );
});

// [pushsubscriptionchange 미구현 — 의도된 결정]
// 이 이벤트는 앱이 떠 있지 않을 때도 발생하므로 SW가 스스로 Authorization 헤더를 채워야 한다.
// 그런데 이 프로젝트의 accessToken은 zustand 인메모리 스토어(useToken)에만 존재하고
// SW는 앱 메모리에 접근할 수 없다. IndexedDB로 토큰을 복제하면 SW에서 읽을 수 있지만
// 토큰 사본이 하나 더 생기는 보안 표면 증가에 비해 얻는 이득이 작다.
// 대신 앱 실행/토큰 변경 시마다 POST /notification/register를 재호출하는 방식(멱등)으로 방어한다.
// iOS Safari는 이 이벤트를 애초에 지원하지 않으므로 실효 커버리지 손실도 제한적이다.
// → 토큰이 HttpOnly 쿠키로 전환되면 credentials: 'include' 만으로 구현 가능해지므로 그때 재검토할 것.
