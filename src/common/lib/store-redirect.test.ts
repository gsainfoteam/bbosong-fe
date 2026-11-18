import { describe, expect, it } from 'vitest';

import { getMobileStore } from './store-redirect';

describe('getMobileStore', () => {
  it('iPhone과 iPad를 ios로 판별한다', () => {
    expect(getMobileStore('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)')).toBe('ios');
    expect(getMobileStore('Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)')).toBe('ios');
  });

  it('터치 포인트가 있는 iPadOS 데스크톱 모드를 ios로 판별한다', () => {
    const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15';
    expect(getMobileStore(ua, 5)).toBe('ios');
    expect(getMobileStore(ua, 0)).toBeNull();
  });

  it('Android를 android로 판별한다', () => {
    expect(getMobileStore('Mozilla/5.0 (Linux; Android 14) Chrome/120.0.0.0 Mobile')).toBe(
      'android',
    );
  });

  it('데스크톱 브라우저는 null을 반환한다', () => {
    expect(getMobileStore('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBeNull();
  });
});
