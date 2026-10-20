import { describe, expect, it } from 'vitest';

import { shiftPowerQueryStart, toDatetimeLocalValue } from './power-query-start';

const now = Date.parse('2026-10-20T06:00:00.000Z');

describe('shiftPowerQueryStart', () => {
  it('extends the default one-hour window', () => {
    expect(shiftPowerQueryStart(undefined, 60, now)).toBe('2026-10-20T04:00:00.000Z');
    expect(shiftPowerQueryStart(undefined, 30, now)).toBe('2026-10-20T04:30:00.000Z');
    expect(shiftPowerQueryStart(undefined, 10, now)).toBe('2026-10-20T04:50:00.000Z');
  });

  it('shifts an existing start earlier by the selected amount', () => {
    expect(shiftPowerQueryStart('2026-10-20T04:00:00.000Z', 60)).toBe('2026-10-20T03:00:00.000Z');
    expect(shiftPowerQueryStart('2026-10-20T04:00:00.000Z', 30)).toBe('2026-10-20T03:30:00.000Z');
    expect(shiftPowerQueryStart('2026-10-20T04:00:00.000Z', 10)).toBe('2026-10-20T03:50:00.000Z');
  });

  it('treats an invalid start as the default one-hour window', () => {
    expect(shiftPowerQueryStart('not-a-date', 10, now)).toBe('2026-10-20T04:50:00.000Z');
  });
});

describe('toDatetimeLocalValue', () => {
  it('formats the local date and minute for a datetime-local input', () => {
    const iso = '2026-10-20T06:15:30.000Z';
    const date = new Date(iso);
    const pad = (value: number) => String(value).padStart(2, '0');
    expect(toDatetimeLocalValue(iso)).toBe(
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`,
    );
  });
});
