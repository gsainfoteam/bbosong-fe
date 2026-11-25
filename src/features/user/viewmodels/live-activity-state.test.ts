import { describe, expect, it } from 'vitest';

import {
  liveActivityTargetKey,
  toLiveActivityContentState,
  toStartedAtSeconds,
  type LiveActivityTarget,
} from './live-activity-state';

const NOW = Date.parse('2026-11-21T12:00:00.000Z');
const nowSeconds = Math.floor(NOW / 1000);

const target = (overrides: Partial<LiveActivityTarget> = {}): LiveActivityTarget => ({
  machineUuid: 'machine-1',
  kind: 'DRYER',
  title: 'A동 건조기 3번',
  startedAt: '2026-11-21T11:30:00.000Z',
  status: 'RUNNING',
  thinqCurrentState: 'RUNNING',
  remainingMinutes: 20,
  thinqUpdatedAt: '2026-11-21T11:55:00.000Z',
  ...overrides,
});

describe('toLiveActivityContentState', () => {
  it('projects the end time from the ThinQ update time and remaining minutes', () => {
    // 11:55 + 20분 = 12:15
    expect(toLiveActivityContentState(target(), NOW)).toEqual({
      state: 'RUNNING',
      endsAt: Math.floor(Date.parse('2026-11-21T12:15:00.000Z') / 1000),
      remainingMinutes: 20,
      updatedAt: Math.floor(Date.parse('2026-11-21T11:55:00.000Z') / 1000),
    });
  });

  it.each(['COOLING', 'PAUSE', 'ERROR'])('keeps the %s state', (thinqCurrentState) => {
    expect(toLiveActivityContentState(target({ thinqCurrentState }), NOW).state).toBe(
      thinqCurrentState,
    );
  });

  it('treats unknown ThinQ states as running', () => {
    expect(
      toLiveActivityContentState(target({ thinqCurrentState: 'FUTURE_STATE' }), NOW).state,
    ).toBe('RUNNING');
  });

  it('shows DETECTING without a time while the remaining time is unknown', () => {
    expect(toLiveActivityContentState(target({ remainingMinutes: null }), NOW)).toEqual({
      state: 'DETECTING',
      endsAt: null,
      remainingMinutes: null,
      updatedAt: nowSeconds,
    });
  });

  it('shows DETECTING without a time when the update time is missing or invalid', () => {
    expect(toLiveActivityContentState(target({ thinqUpdatedAt: null }), NOW).endsAt).toBeNull();
    expect(toLiveActivityContentState(target({ thinqUpdatedAt: 'nope' }), NOW).endsAt).toBeNull();
  });

  it('drops the time when the projected end is already in the past', () => {
    expect(
      toLiveActivityContentState(target({ thinqUpdatedAt: '2026-11-21T11:00:00.000Z' }), NOW),
    ).toEqual({ state: 'RUNNING', endsAt: null, remainingMinutes: null, updatedAt: nowSeconds });
  });

  it.each([
    [{ status: 'IDLE' }],
    [{ thinqCurrentState: 'END' }],
    [{ thinqCurrentState: 'POWER_OFF' }],
    [{ thinqCurrentState: 'WRINKLE_CARE' }],
  ])('marks %j as finished', (overrides) => {
    expect(toLiveActivityContentState(target(overrides), NOW)).toEqual({
      state: 'END',
      endsAt: nowSeconds,
      remainingMinutes: 0,
      updatedAt: nowSeconds,
    });
  });
});

describe('liveActivityTargetKey', () => {
  it('is stable for equal content and changes when anything shown changes', () => {
    expect(liveActivityTargetKey(target())).toBe(liveActivityTargetKey(target()));
    expect(liveActivityTargetKey(target({ remainingMinutes: 10 }))).not.toBe(
      liveActivityTargetKey(target()),
    );
    expect(liveActivityTargetKey(target({ title: 'B동 건조기 1번' }))).not.toBe(
      liveActivityTargetKey(target()),
    );
  });
});

describe('washer', () => {
  it('has no time while running when the user has not entered one', () => {
    expect(
      toLiveActivityContentState(
        target({ kind: 'WASHER', remainingMinutes: null, thinqCurrentState: null }),
        NOW,
      ),
    ).toEqual({ state: 'RUNNING', endsAt: null, remainingMinutes: null, updatedAt: nowSeconds });
  });

  it('counts down to the time the user entered', () => {
    // 12:00 기준 12:37 종료 → 37분 남음
    expect(
      toLiveActivityContentState(
        target({
          kind: 'WASHER',
          remainingMinutes: null,
          thinqCurrentState: null,
          thinqUpdatedAt: null,
          estimatedEndsAt: '2026-11-21T12:37:00.000Z',
        }),
        NOW,
      ),
    ).toEqual({
      state: 'RUNNING',
      endsAt: Math.floor(Date.parse('2026-11-21T12:37:00.000Z') / 1000),
      remainingMinutes: 37,
      updatedAt: nowSeconds,
    });
  });

  it.each([null, 'nope', '2026-11-21T12:00:00.000Z', '2026-11-21T11:50:00.000Z'])(
    'shows the elapsed time when the entered end time is %s',
    (estimatedEndsAt) => {
      expect(toLiveActivityContentState(target({ kind: 'WASHER', estimatedEndsAt }), NOW)).toEqual({
        state: 'RUNNING',
        endsAt: null,
        remainingMinutes: null,
        updatedAt: nowSeconds,
      });
    },
  );

  it('ignores the entered time once the machine is idle', () => {
    expect(
      toLiveActivityContentState(
        target({ kind: 'WASHER', status: 'IDLE', estimatedEndsAt: '2026-11-21T12:37:00.000Z' }),
        NOW,
      ).state,
    ).toBe('END');
  });

  it('changes key when the entered time changes', () => {
    expect(liveActivityTargetKey(target({ kind: 'WASHER', estimatedEndsAt: 'a' }))).not.toBe(
      liveActivityTargetKey(target({ kind: 'WASHER', estimatedEndsAt: 'b' })),
    );
  });

  it('is finished once the machine is idle', () => {
    expect(
      toLiveActivityContentState(
        target({ kind: 'WASHER', status: 'IDLE', remainingMinutes: null }),
        NOW,
      ).state,
    ).toBe('END');
  });

  it('does not share a key with a dryer of the same machine', () => {
    expect(liveActivityTargetKey(target({ kind: 'WASHER' }))).not.toBe(
      liveActivityTargetKey(target()),
    );
  });
});

describe('toStartedAtSeconds', () => {
  it('converts the start time to epoch seconds', () => {
    expect(toStartedAtSeconds('2026-11-21T11:30:00.000Z', NOW)).toBe(
      Math.floor(Date.parse('2026-11-21T11:30:00.000Z') / 1000),
    );
  });

  it.each([null, 'nope', '2026-11-21T13:00:00.000Z'])('falls back to now for %s', (value) => {
    expect(toStartedAtSeconds(value, NOW)).toBe(nowSeconds);
  });
});
