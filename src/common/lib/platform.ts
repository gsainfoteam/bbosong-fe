import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

/** Capacitor 네이티브 셸(iOS/Android 앱)에서 실행 중인지 여부 */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

/** 네이티브 앱의 커스텀 URL 스킴 (ios/Info.plist, AndroidManifest.xml과 동일 문자열 유지) */
export const NATIVE_URL_SCHEME = 'me.gistory.bbosong';

/** 네이티브 앱의 OIDC 콜백 URI. IDP 클라이언트의 redirect URI에도 등록되어 있어야 한다 */
export const NATIVE_AUTH_REDIRECT_URI = `${NATIVE_URL_SCHEME}://auth/callback`;

/** 인앱 브라우저 닫힘을 기다리는 최대 시간 */
const CLOSE_BROWSER_TIMEOUT_MS = 1000;

/**
 * 인앱 브라우저가 닫힌 뒤 콜백(appUrlOpen)이 도착할 때까지 기다리는 시간.
 * Android Custom Tabs는 콜백 인텐트와 복귀(browserFinished)의 도착 순서가 보장되지 않아,
 * 이 시간 안에 콜백이 오면 사용자 취소가 아니라고 본다.
 */
const CANCEL_GRACE_MS = 1500;

/** react-oauth2-code-pkce가 로그인 팝업에 쓰는 window 이름 */
const AUTH_POPUP_NAME = 'loginPopup';

/** react-oauth2-code-pkce가 로그인 진행 여부를 저장하는 키 (기본 storageKeyPrefix 'ROCP_' + 'loginInProgress') */
const LOGIN_IN_PROGRESS_STORAGE_KEY = 'ROCP_loginInProgress';

/** 현재 로그인 시도에서 인증 콜백을 받았는지 여부 */
let authCallbackReceived = false;

/** 콜백 URL이면 code/state 쿼리 문자열(`?code=...`)을, 아니면 null을 반환한다 */
function parseAuthCallback(url: string | undefined): string | null {
  if (!url?.startsWith(NATIVE_AUTH_REDIRECT_URI)) return null;

  return new URL(url).search;
}

/** 콜백 없이 인앱 브라우저가 닫혔을 때 라이브러리의 로그인 진행 상태를 해제한다 */
function cancelPendingLogin(): void {
  try {
    if (!window.localStorage.getItem(LOGIN_IN_PROGRESS_STORAGE_KEY)) return;
    window.localStorage.removeItem(LOGIN_IN_PROGRESS_STORAGE_KEY);
  } catch {
    return;
  }

  // 라이브러리는 마운트 시점에만 저장소 값을 읽으므로 리로드로 상태를 다시 읽게 한다
  window.location.reload();
}

/**
 * 인앱 브라우저에서 IDP 인증을 마치고 커스텀 스킴으로 앱에 복귀하면,
 * 콜백의 code/state 쿼리를 웹 앱 루트로 넘겨 react-oauth2-code-pkce가 이어서 처리하게 한다.
 * (웹은 redirectUri가 루트라 라이브러리가 마운트 시 location.search에서 직접 읽는다)
 *
 * 인증 중 앱 프로세스가 종료되어 콜백이 콜드 스타트로 들어오면 appUrlOpen이 발생하지 않으므로
 * getLaunchUrl()로 복원한다. 인증 공급자가 마운트되기 전에 끝나도록 반환 Promise를 기다린 뒤 렌더해야 한다.
 */
export async function initNativeAuthCallback(): Promise<void> {
  if (!isNativeApp()) return;

  // react-oauth2-code-pkce의 loginMethod:'popup'은 window.open(loginUrl, 'loginPopup')을 호출한다.
  // 네이티브에서는 이를 인앱 브라우저(SFSafariViewController/Custom Tabs)로 연결한다.
  const originalOpen = window.open.bind(window);
  window.open = (url, target, features) => {
    if (target !== AUTH_POPUP_NAME || !url) return originalOpen(url, target, features);

    authCallbackReceived = false;
    void Browser.open({ url: url.toString() });
    // 라이브러리는 반환값의 truthy 여부만 확인한다 (null이면 일반 리다이렉트로 폴백)
    return {} as Window;
  };

  void App.addListener('appUrlOpen', ({ url }) => {
    const search = parseAuthCallback(url);
    if (search === null) return;

    // close()가 browserFinished를 발생시킬 수 있으므로 반드시 close() 전에 설정한다
    authCallbackReceived = true;

    // 인앱 브라우저가 완전히 닫힌 뒤 리로드한다. 닫힘 전환과 페이지 전환이 겹치면
    // 이전 문서에서 렌더가 이어져 `localStorage`가 null인 상태로 실행될 수 있다.
    // close()가 끝나지 않는 경우를 대비해 대기 시간을 제한한다.
    const closed = Browser.close().catch(() => {});
    const timeout = new Promise((resolve) => setTimeout(resolve, CLOSE_BROWSER_TIMEOUT_MS));
    void Promise.race([closed, timeout]).then(() => window.location.replace(`/${search}`));
  });

  // 인증을 끝내지 않고 인앱 브라우저를 닫으면 콜백이 오지 않는다.
  // 로그인 진행 상태가 남으면 루트 레이아웃이 로딩 화면에 머물므로 해제한다.
  void Browser.addListener('browserFinished', () => {
    window.setTimeout(() => {
      if (!authCallbackReceived) cancelPendingLogin();
    }, CANCEL_GRACE_MS);
  });

  // 콜드 스타트로 들어온 콜백: 렌더 전에 URL만 바꿔 두면 라이브러리가 마운트 시 code를 읽는다
  const launchSearch = await App.getLaunchUrl()
    .then((launch) => parseAuthCallback(launch?.url))
    .catch(() => null);
  if (launchSearch !== null) {
    authCallbackReceived = true;
    window.history.replaceState(null, '', `/${launchSearch}`);
  }
}
