import { App } from '@capacitor/app';
import { CapacitorUpdater } from '@capgo/capacitor-updater';

import { APP_LINK_HOST, isNativeApp } from './platform';

/**
 * 네이티브 앱 OTA(웹 번들 교체) 레이어.
 *
 * 웹 배포에 함께 실리는 `latest.json`(scripts/vite-plugin-ota-bundle.ts)을 조회해,
 * 현재 실행 중인 번들과 다르면 zip을 내려받아 다음 실행에 적용한다.
 * 서버 통신은 웹 호스트의 정적 파일뿐이며 Capgo 클라우드는 사용하지 않는다.
 */

const OTA_ORIGIN = `https://${APP_LINK_HOST}`;
const MANIFEST_URL = `${OTA_ORIGIN}/latest.json`;
const FETCH_TIMEOUT_MS = 10_000;

/** 같은 버전을 다시 시도하지 않기 위한 기록 키. 번들이 바뀌어도 같은 origin이라 유지된다 */
const ATTEMPTED_VERSION_KEY = 'ota-attempted-version';

/** 포그라운드 복귀 시 확인 간격 */
const CHECK_INTERVAL_MS = 30 * 60 * 1000;

export type NativeUpdateManifest = {
  version: string;
  url: string;
  checksum: string;
  minNativeVersion: string;
};

/** `1.2.3` 형식의 버전을 숫자 배열로 바꾼다. 형식이 맞지 않으면 null */
function parseVersion(version: string): number[] | null {
  const parts = version.split('.');
  if (parts.length === 0 || parts.some((part) => !/^\d+$/.test(part))) return null;

  return parts.map(Number);
}

/** `version`이 `minimum` 이상인지 여부. 파싱할 수 없으면 false(적용하지 않는 쪽이 안전하다) */
export function isVersionAtLeast(version: string, minimum: string): boolean {
  const current = parseVersion(version);
  const required = parseVersion(minimum);
  if (!current || !required) return false;

  for (let index = 0; index < Math.max(current.length, required.length); index += 1) {
    const difference = (current[index] ?? 0) - (required[index] ?? 0);
    if (difference !== 0) return difference > 0;
  }

  return true;
}

/** 응답이 매니페스트 형식인지 검증한다 (배포에 매니페스트가 없으면 SPA 폴백 HTML이 올 수 있다) */
export function parseUpdateManifest(value: unknown): NativeUpdateManifest | null {
  if (typeof value !== 'object' || value === null) return null;

  const { version, url, checksum, minNativeVersion } = value as Record<string, unknown>;
  if (
    typeof version !== 'string' ||
    typeof url !== 'string' ||
    typeof checksum !== 'string' ||
    typeof minNativeVersion !== 'string' ||
    !version ||
    !url ||
    !checksum
  ) {
    return null;
  }

  return { version, url, checksum, minNativeVersion };
}

/** 이 번들을 새 번들로 교체해야 하는지 판단한다 */
export function shouldApplyUpdate(
  manifest: NativeUpdateManifest,
  context: { currentVersion: string; nativeVersion: string; attemptedVersion: string | null },
): boolean {
  if (manifest.version === context.currentVersion) return false;
  // 새 번들이 쓰는 네이티브 기능이 이 바이너리에 없을 수 있다. 스토어 업데이트가 먼저 필요하다
  if (!isVersionAtLeast(context.nativeVersion, manifest.minNativeVersion)) return false;
  // 이미 받았거나(다음 실행 대기), 받아서 적용했지만 롤백된 버전은 다시 받지 않는다
  if (manifest.version === context.attemptedVersion) return false;

  return true;
}

function readAttemptedVersion(): string | null {
  try {
    return window.localStorage.getItem(ATTEMPTED_VERSION_KEY);
  } catch {
    return null;
  }
}

function writeAttemptedVersion(version: string): void {
  try {
    window.localStorage.setItem(ATTEMPTED_VERSION_KEY, version);
  } catch {
    // 기록하지 못하면 다음 확인에서 다시 시도할 뿐이다
  }
}

async function fetchManifest(): Promise<NativeUpdateManifest | null> {
  const response = await fetch(MANIFEST_URL, {
    cache: 'no-store',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) return null;

  return parseUpdateManifest(await response.json().catch(() => null));
}

let checking = false;

/** 새 번들이 있으면 내려받아 다음 실행에 적용되도록 예약한다. 실패는 조용히 무시한다 */
export async function checkForNativeUpdate(): Promise<void> {
  if (!isNativeApp() || checking) return;

  checking = true;
  try {
    const manifest = await fetchManifest();
    if (!manifest) return;

    const { version: nativeVersion } = await App.getInfo();
    const shouldApply = shouldApplyUpdate(manifest, {
      currentVersion: __BUILD_VERSION__,
      nativeVersion,
      attemptedVersion: readAttemptedVersion(),
    });
    if (!shouldApply) return;

    // 다운로드 도중 실패해도 같은 번들을 반복해서 시도하지 않도록 먼저 기록한다
    writeAttemptedVersion(manifest.version);

    const bundle = await CapacitorUpdater.download({
      url: new URL(manifest.url, OTA_ORIGIN).toString(),
      version: manifest.version,
      checksum: manifest.checksum,
    });
    await CapacitorUpdater.next({ id: bundle.id });
  } catch (error) {
    console.error('Failed to check for a native update.', error);
  } finally {
    checking = false;
  }
}

/**
 * OTA를 시작한다. 번들이 정상 실행됨을 알리고(이 호출이 없으면 플러그인이 이전 번들로 롤백한다),
 * 시작 시와 포그라운드 복귀 시 새 번들을 확인한다.
 *
 * 네트워크 요청보다 먼저 호출해야 하므로 앱 진입점에서 최대한 이르게 호출한다.
 */
export async function initNativeUpdate(): Promise<void> {
  if (!isNativeApp()) return;

  await CapacitorUpdater.notifyAppReady().catch((error: unknown) => {
    console.error('Failed to notify the updater that the app is ready.', error);
  });

  let lastCheckedAt = Date.now();
  void checkForNativeUpdate();

  void App.addListener('resume', () => {
    if (Date.now() - lastCheckedAt < CHECK_INTERVAL_MS) return;

    lastCheckedAt = Date.now();
    void checkForNativeUpdate();
  });
}
