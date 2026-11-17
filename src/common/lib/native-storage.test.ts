import { describe, expect, it, vi } from 'vitest';

import { createMirroredStorage, type StorageBackend } from './native-storage';

function createFakeStorage(initial: Record<string, string> = {}): Storage {
  const map = new Map(Object.entries(initial));

  return {
    get length() {
      return map.size;
    },
    key: (index) => Array.from(map.keys())[index] ?? null,
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, String(value)),
    removeItem: (key) => void map.delete(key),
    clear: () => map.clear(),
  };
}

function createFakeBackend(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  const backend = {
    keys: vi.fn(async () => Array.from(map.keys())),
    get: vi.fn(async (key: string) => map.get(key) ?? null),
    set: vi.fn(async (key: string, value: string) => void map.set(key, value)),
    remove: vi.fn(async (key: string) => void map.delete(key)),
    clear: vi.fn(async () => map.clear()),
  } satisfies StorageBackend;

  return { backend, map };
}

describe('createMirroredStorage', () => {
  it('원본에 없는 키를 네이티브 값으로 복원한다', async () => {
    const original = createFakeStorage();
    const { backend } = createFakeBackend({ ROCP_token: 'abc' });

    await createMirroredStorage(() => original, backend);

    expect(original.getItem('ROCP_token')).toBe('abc');
  });

  it('원본에만 있는 키를 네이티브에 채워 넣는다', async () => {
    const original = createFakeStorage({ location: 'a' });
    const { backend, map } = createFakeBackend();

    await createMirroredStorage(() => original, backend);

    expect(map.get('location')).toBe('a');
  });

  it('원본이 정상이면 읽기/쓰기는 원본에 하고 쓰기를 네이티브에도 미러링한다', async () => {
    const original = createFakeStorage();
    const { backend, map } = createFakeBackend();
    const storage = await createMirroredStorage(() => original, backend);

    storage.setItem('k', 'v');

    expect(original.getItem('k')).toBe('v');
    expect(storage.getItem('k')).toBe('v');
    expect(map.get('k')).toBe('v');

    storage.removeItem('k');

    expect(original.getItem('k')).toBeNull();
    expect(map.has('k')).toBe(false);

    storage.setItem('a', '1');
    storage.clear();

    expect(original.length).toBe(0);
    expect(map.size).toBe(0);
  });

  it('원본이 null이면 메모리 사본으로 읽고 쓴다', async () => {
    const { backend } = createFakeBackend({ ROCP_token: 'abc' });
    const storage = await createMirroredStorage(() => null, backend);

    expect(storage.getItem('ROCP_token')).toBe('abc');

    storage.setItem('k', 'v');

    expect(storage.getItem('k')).toBe('v');
    expect(storage.length).toBe(2);
    expect(storage.key(1)).toBe('k');
    expect(storage.getItem('missing')).toBeNull();
  });

  it('원본이 중간에 null/예외가 되어도 최신 값을 유지한다', async () => {
    const original = createFakeStorage();
    const { backend } = createFakeBackend();
    let broken: 'none' | 'null' | 'throw' = 'none';
    const storage = await createMirroredStorage(() => {
      if (broken === 'null') return null;
      if (broken === 'throw') throw new Error('denied');
      return original;
    }, backend);

    storage.setItem('ROCP_token', 'latest');
    broken = 'null';

    expect(storage.getItem('ROCP_token')).toBe('latest');

    broken = 'throw';
    storage.setItem('ROCP_token', 'newer');

    expect(storage.getItem('ROCP_token')).toBe('newer');
  });

  it('네이티브 쓰기가 실패해도 예외를 던지지 않는다', async () => {
    const original = createFakeStorage();
    const { backend } = createFakeBackend();
    backend.set.mockRejectedValue(new Error('native failure'));
    const storage = await createMirroredStorage(() => original, backend);

    expect(() => storage.setItem('k', 'v')).not.toThrow();
    expect(storage.getItem('k')).toBe('v');
  });
});
