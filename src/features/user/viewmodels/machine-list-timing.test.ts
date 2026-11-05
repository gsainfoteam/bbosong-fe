import { describe, expect, it } from 'vitest';

import { getMachineDisplayRemainingMinutes, getMachineElapsedMinutes } from './machine-list-timing';

describe('getMachineElapsedMinutes', () => {
  it('returns elapsed whole minutes from startedAt', () => {
    const now = Date.parse('2026-11-05T12:30:00Z');
    expect(getMachineElapsedMinutes('2026-11-05T11:00:00Z', now)).toBe(90);
  });

  it('returns undefined when startedAt is missing', () => {
    expect(getMachineElapsedMinutes(null, Date.now())).toBeUndefined();
    expect(getMachineElapsedMinutes(undefined, Date.now())).toBeUndefined();
  });
});

describe('getMachineDisplayRemainingMinutes', () => {
  it('returns remaining minutes only for ThinQ-mapped machines', () => {
    expect(
      getMachineDisplayRemainingMinutes({
        thinqDeviceId: 'device-1',
        thinqRemainingMinutes: 45,
      }),
    ).toBe(45);
    expect(
      getMachineDisplayRemainingMinutes({
        thinqDeviceId: null,
        thinqRemainingMinutes: 45,
      }),
    ).toBeUndefined();
  });
});
