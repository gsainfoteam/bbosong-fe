import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * 진동 피드백. 네이티브 앱에서는 OS 햅틱(iOS Taptic Engine, Android VibrationEffect)을 쓰고,
 * 웹에서는 플러그인이 `navigator.vibrate`로 대신한다.
 *
 * 미지원 브라우저(iOS Safari 등)에서는 플러그인이 예외를 던지므로 모두 삼킨다.
 * 햅틱은 부가 효과라서 실패해도 사용자 흐름을 막지 않는다.
 * 네이티브 플러그인이 없는 구버전 앱에도 같은 이유로 안전하다. (OTA는 `ota.minNativeVersion`으로 막는다)
 */
const run = (feedback: () => Promise<void>): void => {
  void feedback().catch(() => {});
};

export const haptic = {
  /** 버튼 등 직접 조작에 주는 가벼운 진동 */
  light: () => run(() => Haptics.impact({ style: ImpactStyle.Light })),
  /** 길게 누르기처럼 의도가 분명한 조작에 주는 진동 */
  medium: () => run(() => Haptics.impact({ style: ImpactStyle.Medium })),
  /** 성공 결과 (QR 인식, 저장 완료 등) */
  success: () => run(() => Haptics.notification({ type: NotificationType.Success })),
  /** 주의가 필요한 결과 */
  warning: () => run(() => Haptics.notification({ type: NotificationType.Warning })),
  /** 실패 결과 */
  error: () => run(() => Haptics.notification({ type: NotificationType.Error })),
};
