import { Preferences } from '@capacitor/preferences';

import { isNativeApp } from './platform';

/** localStorage 미러 전용 Preferences 그룹 (다른 용도의 Preferences와 키가 섞이지 않게 한다) */
const PREFERENCES_GROUP = 'local-storage-mirror';

/** 미러가 저장하는 비동기 네이티브 저장소 */
export type StorageBackend = {
  keys: () => Promise<string[]>;
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<void>;
  remove: (key: string) => Promise<void>;
  clear: () => Promise<void>;
};

const preferencesBackend: StorageBackend = {
  keys: async () => (await Preferences.keys()).keys,
  get: async (key) => (await Preferences.get({ key })).value,
  set: (key, value) => Preferences.set({ key, value }),
  remove: (key) => Preferences.remove({ key }),
  clear: () => Preferences.clear(),
};

/**
 * 동기 `Storage`처럼 동작하면서 모든 쓰기를 비동기 네이티브 저장소에 미러링한다.
 *
 * - 원본 localStorage가 정상이면 읽기/쓰기는 원본에 하고, 쓰기를 메모리와 네이티브에도 남긴다.
 * - 원본이 null이거나 예외를 던지면 메모리 사본으로 읽고 쓴다.
 * - 생성 시 네이티브 값을 읽어 와 원본에 없는 키는 복원한다. (OS가 WebView 저장소를 지운 경우 대비)
 *   원본에만 있는 키는 네이티브에 채워 넣는다.
 */
export async function createMirroredStorage(
  getOriginal: () => Storage | null,
  backend: StorageBackend,
): Promise<Storage> {
  const cache = new Map<string, string>();
  const ignore = () => {};

  await Promise.all(
    (await backend.keys()).map(async (key) => {
      const value = await backend.get(key);
      if (value !== null) cache.set(key, value);
    }),
  );

  // 원본 접근이 실패하면 undefined를 돌려줘 호출 측이 메모리 사본으로 폴백하게 한다
  const withOriginal = <T>(run: (storage: Storage) => T): T | undefined => {
    try {
      const storage = getOriginal();
      return storage ? run(storage) : undefined;
    } catch {
      return undefined;
    }
  };

  // 부팅 동기화: 네이티브에만 있는 키는 원본으로 복원, 원본에만 있거나 다른 값은 네이티브로 반영
  withOriginal((original) => {
    for (const [key, value] of cache) {
      if (original.getItem(key) === null) original.setItem(key, value);
    }
    const originalKeys = Array.from({ length: original.length }, (_, index) => original.key(index));
    for (const key of originalKeys) {
      if (key === null) continue;
      const value = original.getItem(key);
      if (value === null || cache.get(key) === value) continue;
      cache.set(key, value);
      backend.set(key, value).catch(ignore);
    }
  });

  const storage = {
    get length() {
      return withOriginal((original) => original.length) ?? cache.size;
    },
    key(index: number) {
      const fromOriginal = withOriginal((original) => original.key(index));
      return fromOriginal === undefined ? (Array.from(cache.keys())[index] ?? null) : fromOriginal;
    },
    getItem(key: string) {
      const fromOriginal = withOriginal((original) => original.getItem(key));
      return fromOriginal === undefined ? (cache.get(key) ?? null) : fromOriginal;
    },
    setItem(key: string, value: string) {
      const stringValue = String(value);
      cache.set(key, stringValue);
      backend.set(key, stringValue).catch(ignore);
      withOriginal((original) => original.setItem(key, stringValue));
    },
    removeItem(key: string) {
      cache.delete(key);
      backend.remove(key).catch(ignore);
      withOriginal((original) => original.removeItem(key));
    },
    clear() {
      cache.clear();
      backend.clear().catch(ignore);
      withOriginal((original) => original.clear());
    },
  };

  return storage as Storage;
}

/**
 * 네이티브 앱에서 `window.localStorage`를 미러링 저장소로 교체한다. 웹에서는 아무것도 하지 않는다.
 *
 * react-oauth2-code-pkce가 저장소를 주입받지 못하고 localStorage를 직접 읽기 때문에 전역을 교체한다.
 * 라이브러리가 마운트되기 전(렌더 전)에 끝나야 한다. 준비에 실패하면 원본을 그대로 둔다.
 * (i18n, amplitude처럼 모듈 import 시점에 저장소를 읽는 코드는 교체 전의 원본을 본다)
 */
export async function installNativeStorage(): Promise<void> {
  if (!isNativeApp()) return;

  const descriptor =
    Object.getOwnPropertyDescriptor(window, 'localStorage') ??
    Object.getOwnPropertyDescriptor(Window.prototype, 'localStorage');
  const getOriginalStorage = descriptor?.get;
  if (!getOriginalStorage) return;

  try {
    await Preferences.configure({ group: PREFERENCES_GROUP });
    const storage = await createMirroredStorage(
      () => getOriginalStorage.call(window) as Storage | null,
      preferencesBackend,
    );
    Object.defineProperty(window, 'localStorage', { configurable: true, get: () => storage });
  } catch (error) {
    console.error('Failed to install native storage mirror.', error);
  }
}
