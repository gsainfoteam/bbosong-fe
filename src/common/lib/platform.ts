import { Capacitor } from '@capacitor/core';

/** Capacitor 네이티브 셸(iOS/Android 앱)에서 실행 중인지 여부 */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}
