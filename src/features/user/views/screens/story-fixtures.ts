import { type MachineView } from '@/features/user/viewmodels';

export const machine = (
  type: MachineView['type'],
  id: number,
  state: MachineView['state'],
  extra: Partial<MachineView> = {},
): MachineView => ({
  uuid: `${type}-${id}`,
  type,
  location: 'a',
  gender: 'male',
  id,
  state,
  phase: type === 'washer' ? 'washing' : 'drying',
  level: 0,
  mine: false,
  ...extra,
});

export const myWasher = machine('washer', 3, 'running', {
  remainingMinutes: 23,
  level: 0.38,
  mine: true,
  endsAt: Date.parse('2026-11-22T21:41:00+09:00'),
});

export const myDryer = machine('dryer', 5, 'running', {
  remainingMinutes: 63,
  level: 0.88,
  mine: true,
  endsAt: Date.parse('2026-11-22T22:21:00+09:00'),
});

export const washers = [
  machine('washer', 1, 'running', { remainingMinutes: 41, level: 0.7 }),
  machine('washer', 2, 'idle'),
  myWasher,
  machine('washer', 4, 'detecting'),
  machine('washer', 5, 'idle'),
  machine('washer', 6, 'off'),
  machine('washer', 7, 'elapsed', { elapsedMinutes: 72 }),
  machine('washer', 8, 'running', { remainingMinutes: 8, level: 0.12 }),
];

export const dryers = [
  machine('dryer', 1, 'running', { remainingMinutes: 52, level: 0.74 }),
  machine('dryer', 2, 'paused', { remainingMinutes: 34, level: 0.5 }),
  machine('dryer', 3, 'detecting'),
  machine('dryer', 4, 'running', { remainingMinutes: 5, level: 0.07 }),
  myDryer,
  machine('dryer', 6, 'running', { remainingMinutes: 20, level: 0.3 }),
  machine('dryer', 7, 'running', { remainingMinutes: 41, level: 0.6 }),
  machine('dryer', 8, 'off'),
];

export const PHONE = { viewport: { value: 'phone', isRotated: false } } as const;
