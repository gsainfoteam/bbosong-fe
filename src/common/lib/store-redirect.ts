/** 앱스토어 앱 ID (App Store Connect의 숫자 Apple ID) */
const APP_STORE_ID = '6835932246';

/** Google Play 패키지명 (android/app/build.gradle의 applicationId와 동일 값 유지) */
const PLAY_PACKAGE_ID = 'me.gistory.bbosong';

/** 스토어 안내를 다시 보지 않기 위한 기록 키 */
export const STORE_PROMPT_DISMISSED_KEY = 'store-prompt-dismissed';

export type MobileStore = 'ios' | 'android';

export const STORE_URLS: Record<MobileStore, string> = {
  ios: `https://apps.apple.com/app/id${APP_STORE_ID}`,
  android: `https://play.google.com/store/apps/details?id=${PLAY_PACKAGE_ID}`,
};

/**
 * User-Agent와 터치 포인트 수로 모바일 스토어 종류를 판별한다.
 * iPadOS 13+ 데스크톱 모드는 UA가 Macintosh로 오므로 터치 포인트로 iPad를 구분한다.
 * 모바일이 아니면 null을 반환한다.
 */
export function getMobileStore(userAgent: string, maxTouchPoints = 0): MobileStore | null {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'ios';
  if (/Macintosh/i.test(userAgent) && maxTouchPoints > 1) return 'ios';
  if (/Android/i.test(userAgent)) return 'android';

  return null;
}

/** 안내 다이얼로그를 보여줘야 하는지 여부. 저장소를 읽을 수 없으면 보여준다 */
export function shouldShowStorePrompt(): boolean {
  try {
    return window.localStorage.getItem(STORE_PROMPT_DISMISSED_KEY) === null;
  } catch {
    return true;
  }
}

/** 다시 보지 않기를 기록한다. 저장에 실패해도 무시한다 */
export function dismissStorePrompt(): void {
  try {
    window.localStorage.setItem(STORE_PROMPT_DISMISSED_KEY, '1');
  } catch {
    // 저장할 수 없으면 다음 방문에 다시 보일 뿐이므로 무시한다
  }
}
