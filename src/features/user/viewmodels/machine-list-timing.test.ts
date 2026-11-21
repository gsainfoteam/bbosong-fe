import { describe, expect, it } from 'vitest';

import { getMachineElapsedMinutes } from './machine-list-timing';

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
