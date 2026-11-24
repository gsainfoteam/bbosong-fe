// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useOnboarding, type UseOnboarding } from './use-onboarding';

const mocks = vi.hoisted(() => ({ supported: vi.fn() }));

vi.mock('@/common/lib', () => ({ isLiveActivitySupported: mocks.supported }));

const STORAGE_KEY = 'bbosong:onboarding-completed';

const all: UseOnboarding.Options['available'] = {
  machines: true,
  alert: true,
  register: true,
  map: true,
  'live-activity': true,
};

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

describe('useOnboarding', () => {
  it('데이터가 준비되기 전에는 시작하지 않는다', async () => {
    const { result } = renderHook(() => useOnboarding({ enabled: false, available: all }));

    await act(() => new Promise((resolve) => requestAnimationFrame(resolve)));

    expect(result.current.step).toBeNull();
  });

  it('준비되면 첫 단계부터 순서대로 보여 주고 마지막에서 완료를 저장한다', async () => {
    const { result } = renderHook(() => useOnboarding({ enabled: true, available: all }));

    await waitFor(() => expect(result.current.step).toBe('machines'));
    expect(result.current.total).toBe(5);

    act(() => result.current.next());
    expect(result.current.step).toBe('alert');
    act(() => result.current.next());
    expect(result.current.step).toBe('register');
    act(() => result.current.next());
    expect(result.current.step).toBe('map');
    act(() => result.current.next());
    expect(result.current.step).toBe('live-activity');
    expect(result.current.isLast).toBe(true);

    act(() => result.current.next());
    expect(result.current.step).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
  });

  it('건너뛰어도 다시 시작하지 않는다', async () => {
    const first = renderHook(() => useOnboarding({ enabled: true, available: all }));
    await waitFor(() => expect(first.result.current.step).toBe('machines'));

    act(() => first.result.current.finish());
    expect(first.result.current.step).toBeNull();
    first.unmount();

    const second = renderHook(() => useOnboarding({ enabled: true, available: all }));
    await act(() => new Promise((resolve) => requestAnimationFrame(resolve)));
    expect(second.result.current.step).toBeNull();
  });

  it('available가 false인 단계는 건너뛴다', async () => {
    const { result } = renderHook(() =>
      useOnboarding({
        enabled: true,
        available: { ...all, machines: false, alert: false, 'live-activity': false },
      }),
    );

    await waitFor(() => expect(result.current.step).toBe('register'));
    expect(result.current.total).toBe(2);

    act(() => result.current.next());
    expect(result.current.step).toBe('map');
    expect(result.current.isLast).toBe(true);
  });

  it('이미 열린 시트가 있으면 시작하지 않는다', async () => {
    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('data-open', '');
    document.body.append(dialog);

    const { result } = renderHook(() => useOnboarding({ enabled: true, available: all }));
    await act(() => new Promise((resolve) => requestAnimationFrame(resolve)));

    expect(result.current.step).toBeNull();
  });

  it('잠금화면 현황 지원 여부를 알려 준다', async () => {
    mocks.supported.mockResolvedValue(true);

    const { result } = renderHook(() => useOnboarding({ enabled: false, available: all }));

    await waitFor(() => expect(result.current.liveActivitySupported).toBe(true));
  });
});
