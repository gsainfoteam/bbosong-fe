import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  vi.stubEnv('VITE_AMPLITUDE_API_KEY', 'test-key');

  let userId: string | undefined;
  return {
    init: vi.fn(),
    track: vi.fn(),
    identify: vi.fn(),
    reset: vi.fn(() => {
      userId = undefined;
    }),
    setUserId: vi.fn((id: string | undefined) => {
      userId = id;
    }),
    getUserId: () => userId,
  };
});
vi.mock('@amplitude/analytics-browser', () => ({
  ...mocks,
  Identify: class {
    set() {
      return this;
    }
  },
  Types: { LogLevel: { Warn: 2 } },
}));

const { identifyAnalyticsUser, markLoginCompleted, resetAnalyticsUser } =
  await import('./amplitude');

beforeEach(() => {
  mocks.setUserId(undefined);
  vi.clearAllMocks();
});

describe('amplitude', () => {
  it('records the login event only after the user is identified', () => {
    markLoginCompleted();
    expect(mocks.track).not.toHaveBeenCalled();

    identifyAnalyticsUser('user-uuid', { role: 'USER' });
    expect(mocks.setUserId).toHaveBeenCalledExactlyOnceWith('user-uuid');
    expect(mocks.track).toHaveBeenCalledExactlyOnceWith('Login Completed');
    expect(mocks.setUserId.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.track.mock.invocationCallOrder[0],
    );

    identifyAnalyticsUser('user-uuid', { role: 'USER' });
    expect(mocks.track).toHaveBeenCalledOnce();
  });

  it('resets only when a user is identified', () => {
    resetAnalyticsUser();
    expect(mocks.reset).not.toHaveBeenCalled();

    identifyAnalyticsUser('user-uuid', {});
    resetAnalyticsUser();
    resetAnalyticsUser();
    expect(mocks.reset).toHaveBeenCalledOnce();
  });
});
