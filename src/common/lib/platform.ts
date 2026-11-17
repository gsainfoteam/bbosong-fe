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

/** react-oauth2-code-pkce가 로그인 팝업에 쓰는 window 이름 */
const AUTH_POPUP_NAME = 'loginPopup';

/**
 * 인앱 브라우저에서 IDP 인증을 마치고 커스텀 스킴으로 앱에 복귀하면,
 * 콜백의 code/state 쿼리를 웹 앱 루트로 넘겨 react-oauth2-code-pkce가 이어서 처리하게 한다.
 * (웹은 redirectUri가 루트라 라이브러리가 마운트 시 location.search에서 직접 읽는다)
 */
export function initNativeAuthCallback(): void {
  if (!isNativeApp()) return;

  // react-oauth2-code-pkce의 loginMethod:'popup'은 window.open(loginUrl, 'loginPopup')을 호출한다.
  // 네이티브에서는 이를 인앱 브라우저(SFSafariViewController/Custom Tabs)로 연결한다.
  const originalOpen = window.open.bind(window);
  window.open = (url, target, features) => {
    if (target !== AUTH_POPUP_NAME || !url) return originalOpen(url, target, features);

    void Browser.open({ url: url.toString() });
    // 라이브러리는 반환값의 truthy 여부만 확인한다 (null이면 일반 리다이렉트로 폴백)
    return {} as Window;
  };

  void App.addListener('appUrlOpen', ({ url }) => {
    if (!url.startsWith(NATIVE_AUTH_REDIRECT_URI)) return;

    const { search } = new URL(url);
    // 인앱 브라우저가 완전히 닫힌 뒤 리로드한다. 닫힘 전환과 페이지 전환이 겹치면
    // 이전 문서에서 렌더가 이어져 `localStorage`가 null인 상태로 실행될 수 있다.
    // close()가 끝나지 않는 경우를 대비해 대기 시간을 제한한다.
    const closed = Browser.close().catch(() => {});
    const timeout = new Promise((resolve) => setTimeout(resolve, CLOSE_BROWSER_TIMEOUT_MS));
    void Promise.race([closed, timeout]).then(() => window.location.replace(`/${search}`));
  });
}
