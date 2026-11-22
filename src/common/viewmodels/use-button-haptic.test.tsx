// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { haptic } from '@/common/lib/haptic';

import { useButtonHaptic } from './use-button-haptic';

vi.mock('@/common/lib/haptic', () => ({ haptic: { light: vi.fn() } }));

function Harness() {
  useButtonHaptic();
  return (
    <div>
      <button>일반</button>
      <button disabled>비활성</button>
      <button aria-busy="true">로딩</button>
      <button data-haptic="off">끔</button>
      <button onClick={(event) => event.preventDefault()}>소비됨</button>
      <button>
        <span>안쪽</span>
      </button>
      <p>텍스트</p>
    </div>
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('useButtonHaptic', () => {
  it('vibrates lightly on button clicks, including clicks on children', () => {
    render(<Harness />);

    fireEvent.click(screen.getByText('일반'));
    fireEvent.click(screen.getByText('안쪽'));

    expect(haptic.light).toHaveBeenCalledTimes(2);
  });

  it('stays quiet for disabled, busy, opted-out, consumed and non-button clicks', () => {
    render(<Harness />);

    fireEvent.click(screen.getByText('비활성'));
    fireEvent.click(screen.getByText('로딩'));
    fireEvent.click(screen.getByText('끔'));
    fireEvent.click(screen.getByText('소비됨'));
    fireEvent.click(screen.getByText('텍스트'));

    expect(haptic.light).not.toHaveBeenCalled();
  });
});
