// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';

import { claimLaunchUrlOnce } from './platform';

describe('claimLaunchUrlOnce', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.history.replaceState(null, '', '/');
  });

  it('프로세스의 첫 로드에서만 true를 반환한다', () => {
    expect(claimLaunchUrlOnce()).toBe(true);
    expect(claimLaunchUrlOnce()).toBe(false);
  });

  it('URL에 이미 콜백 code가 있으면 시작 URL로 덮어쓰지 않는다', () => {
    window.history.replaceState(null, '', '/?code=fresh');

    expect(claimLaunchUrlOnce()).toBe(false);
  });

  it('sessionStorage를 쓸 수 없으면 false를 반환한다', () => {
    const original = Object.getOwnPropertyDescriptor(window, 'sessionStorage');
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      get: () => {
        throw new Error('denied');
      },
    });

    expect(claimLaunchUrlOnce()).toBe(false);

    if (original) Object.defineProperty(window, 'sessionStorage', original);
  });
});
