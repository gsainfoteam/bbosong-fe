import { describe, expect, it } from 'vitest';

import { getMachineElapsedMinutes, getMachineRemainingDisplay } from './machine-list-timing';

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

describe('getMachineRemainingDisplay', () => {
  it('returns minutes for ThinQ-mapped machines with a known remaining time', () => {
    expect(
      getMachineRemainingDisplay({
        thinqDeviceId: 'device-1',
        thinqCurrentState: 'DRYING',
        thinqRemainingMinutes: 45,
        status: 'DRY',
      }),
    ).toEqual({ kind: 'minutes', minutes: 45 });
  });

  it('returns detecting for DETECTING or running ThinQ machines without remaining time', () => {
    expect(
      getMachineRemainingDisplay({
        thinqDeviceId: 'device-1',
        thinqCurrentState: 'DETECTING',
        thinqRemainingMinutes: null,
        status: 'DRY',
      }),
    ).toEqual({ kind: 'detecting' });
    expect(
      getMachineRemainingDisplay({
        thinqDeviceId: 'device-1',
        thinqCurrentState: 'DRYING',
        thinqRemainingMinutes: null,
        status: 'DRY',
      }),
    ).toEqual({ kind: 'detecting' });
  });

  it('returns undefined for unmapped machines so the UI can fall back to elapsed time', () => {
    expect(
      getMachineRemainingDisplay({
        thinqDeviceId: null,
        thinqRemainingMinutes: 45,
        status: 'DRY',
      }),
    ).toBeUndefined();
  });
});
