import { describe, expect, it } from 'vitest';

import { type MachineListItem } from '../models';
import { toMachineView } from './machine-view';

const NOW = Date.parse('2026-11-22T12:30:00Z');

const machine = (overrides: Record<string, unknown> = {}) =>
  ({
    uuid: 'm-1',
    type: 'DRYER',
    location: 'A',
    gender: 'MALE',
    index: 5,
    isAvailable: true,
    status: 'DRY',
    thinqDeviceId: 'device-1',
    thinqCurrentState: 'DRYING',
    thinqRemainingMinutes: 30,
    thinqUpdatedAt: '2026-11-22T12:30:00Z',
    currentUsage: { startedAt: '2026-11-22T12:00:00Z' },
    ...overrides,
  }) as unknown as MachineListItem;

const NONE = new Set<string>();

describe('toMachineView', () => {
  it('fills by remaining over elapsed plus remaining', () => {
    const view = toMachineView(machine(), NOW, NONE);
    expect(view).toMatchObject({ state: 'running', remainingMinutes: 30, level: 0.5 });
    expect(view.endsAt).toBe(Date.parse('2026-11-22T13:00:00Z'));
  });

  it('counts down from the last ThinQ update', () => {
    const view = toMachineView(machine({ thinqUpdatedAt: '2026-11-22T12:20:00Z' }), NOW, NONE);
    expect(view.remainingMinutes).toBe(20);
  });

  it('marks unavailable machines off before anything else', () => {
    expect(toMachineView(machine({ isAvailable: false }), NOW, NONE).state).toBe('off');
  });

  it('marks idle machines idle', () => {
    expect(toMachineView(machine({ status: 'IDLE' }), NOW, NONE).state).toBe('idle');
  });

  it('reports detecting while ThinQ has no remaining time', () => {
    const view = toMachineView(machine({ thinqRemainingMinutes: null }), NOW, NONE);
    expect(view.state).toBe('detecting');
  });

  it('falls back to elapsed time for machines without ThinQ', () => {
    const view = toMachineView(
      machine({ type: 'WASHER', thinqDeviceId: null, thinqCurrentState: null }),
      NOW,
      NONE,
    );
    expect(view).toMatchObject({ state: 'elapsed', elapsedMinutes: 30, phase: 'washing' });
  });

  it('keeps the remaining time while paused', () => {
    const view = toMachineView(machine({ thinqCurrentState: 'PAUSE' }), NOW, NONE);
    expect(view).toMatchObject({ state: 'paused', remainingMinutes: 30 });
  });

  it('shows the cooling phase for dryers', () => {
    expect(toMachineView(machine({ thinqCurrentState: 'COOLING' }), NOW, NONE).phase).toBe(
      'cooling',
    );
  });

  it('flags machines the user registered', () => {
    expect(toMachineView(machine(), NOW, new Set(['m-1'])).mine).toBe(true);
  });
});
