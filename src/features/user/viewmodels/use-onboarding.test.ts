// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useOnboarding, type UseOnboarding } from './use-onboarding';

const mocks = vi.hoisted(() => ({ supported: vi.fn() }));

vi.mock('@/common/lib', () => ({ isLiveActivitySupported: mocks.supported }));

const STORAGE_KEY = 'bbosong:onboarding-seen';

const all: UseOnboarding.Options['available'] = {
  machines: true,
  alert: true,
  register: true,
  'washer-time': false,
  map: true,
  'live-activity': true,
};

const readSeen = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as string[];

// Node의 실험적 localStorage 전역이 jsdom 것을 가려 못 쓰므로 메모리 저장소로 바꾼다
const createStorage = (): Storage => {
  const items = new Map<string, string>();
  return {
    get length() {
      return items.size;
    },
    key: (index) => Array.from(items.keys())[index] ?? null,
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, String(value)),
    removeItem: (key) => void items.delete(key),
    clear: () => items.clear(),
  };
};

beforeEach(() => {
  vi.stubGlobal('localStorage', createStorage());
  mocks.supported.mockResolvedValue(false);
});

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
  document.body.innerHTML = '';
});

const frame = () => act(() => new Promise((resolve) => requestAnimationFrame(resolve)));

describe('useOnboarding', () => {
  it('데이터가 준비되기 전에는 시작하지 않는다', async () => {
    const { result } = renderHook(() => useOnboarding({ enabled: false, available: all }));

    await frame();

    expect(result.current.step).toBeNull();
  });

  it('준비되면 첫 단계부터 순서대로 보여 주고, 넘어갈 때마다 본 단계를 기록한다', async () => {
    const { result } = renderHook(() => useOnboarding({ enabled: true, available: all }));

    await waitFor(() => expect(result.current.step).toBe('machines'));
    expect(result.current.total).toBe(5);
    expect(readSeen()).toEqual([]);

    act(() => result.current.next());
    expect(result.current.step).toBe('alert');
    expect(readSeen()).toEqual(['machines']);

    act(() => result.current.next());
    expect(result.current.step).toBe('register');
    act(() => result.current.next());
    expect(result.current.step).toBe('map');
    act(() => result.current.next());
    expect(result.current.step).toBe('live-activity');
    expect(result.current.isLast).toBe(true);

    act(() => result.current.next());
    expect(result.current.step).toBeNull();
    expect(readSeen()).toEqual(['machines', 'alert', 'register', 'map', 'live-activity']);
  });

  it('내 세탁기가 있으면 등록 다음에 남은 시간 기록 단계를 보여 준다', async () => {
    const { result } = renderHook(() =>
      useOnboarding({ enabled: true, available: { ...all, 'washer-time': true } }),
    );

    await waitFor(() => expect(result.current.step).toBe('machines'));
    expect(result.current.total).toBe(6);
    act(() => result.current.next());
    act(() => result.current.next());
    act(() => result.current.next());
    expect(result.current.step).toBe('washer-time');
    act(() => result.current.next());
    expect(result.current.step).toBe('map');
  });

  it('건너뛰면 남은 단계도 본 것으로 기록하고 다시 시작하지 않는다', async () => {
    const first = renderHook(() => useOnboarding({ enabled: true, available: all }));
    await waitFor(() => expect(first.result.current.step).toBe('machines'));

    act(() => first.result.current.next());
    act(() => first.result.current.finish());
    expect(first.result.current.step).toBeNull();
    expect(readSeen()).toEqual(['machines', 'alert', 'register', 'map', 'live-activity']);
    first.unmount();

    const second = renderHook(() => useOnboarding({ enabled: true, available: all }));
    await frame();
    expect(second.result.current.step).toBeNull();
  });

  it('available가 false인 단계는 건너뛰고 기록하지 않는다', async () => {
    const { result } = renderHook(() =>
      useOnboarding({ enabled: true, available: { ...all, alert: false, 'live-activity': false } }),
    );

    await waitFor(() => expect(result.current.step).toBe('machines'));
    expect(result.current.total).toBe(3);

    act(() => result.current.next());
    expect(result.current.step).toBe('register');
    act(() => result.current.finish());

    expect(readSeen()).toEqual(['machines', 'register', 'map']);
  });

  it('이미 본 단계는 빼고, 새로 생기거나 못 본 단계만 보여 준다', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(['machines', 'register', 'map', 'live-activity']),
    );

    const { result } = renderHook(() => useOnboarding({ enabled: true, available: all }));

    await waitFor(() => expect(result.current.step).toBe('alert'));
    expect(result.current.total).toBe(1);
    expect(result.current.isLast).toBe(true);
  });

  it('저장된 값이 깨졌거나 모르는 단계가 섞여 있어도 견딘다', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['machines', 'removed-step', 3]));

    const { result } = renderHook(() => useOnboarding({ enabled: true, available: all }));

    await waitFor(() => expect(result.current.step).toBe('alert'));

    localStorage.setItem(STORAGE_KEY, '{broken');
    const second = renderHook(() => useOnboarding({ enabled: true, available: all }));
    await waitFor(() => expect(second.result.current.step).toBe('machines'));
  });

  it('시작한 뒤 available이 바뀌어도 단계 목록은 그대로다', async () => {
    const { result, rerender } = renderHook(
      ({ available }) => useOnboarding({ enabled: true, available }),
      { initialProps: { available: { ...all, alert: false } } },
    );

    await waitFor(() => expect(result.current.step).toBe('machines'));
    expect(result.current.total).toBe(4);

    rerender({ available: all });
    expect(result.current.total).toBe(4);

    act(() => result.current.next());
    expect(result.current.step).toBe('register');
  });

  it('이미 열린 시트가 있으면 시작하지 않는다', async () => {
    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('data-open', '');
    document.body.append(dialog);

    const { result } = renderHook(() => useOnboarding({ enabled: true, available: all }));
    await frame();

    expect(result.current.step).toBeNull();
  });

  it('잠금화면 현황 지원 여부를 알려 준다', async () => {
    mocks.supported.mockResolvedValue(true);

    const { result } = renderHook(() => useOnboarding({ enabled: false, available: all }));

    await waitFor(() => expect(result.current.liveActivitySupported).toBe(true));
  });
});
