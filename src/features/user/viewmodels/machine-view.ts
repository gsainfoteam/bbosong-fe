import { isThinqRemainingDetecting, resolveRemainingMinutes } from '@/common/utils';

import { type MachineListItem } from '../models';
import { getMachineElapsedMinutes } from './machine-list-timing';

export type MachineType = 'washer' | 'dryer';

export type MachineLocation = 'a' | 'b';

export type MachineState = 'idle' | 'running' | 'paused' | 'detecting' | 'elapsed' | 'off';

export type MachinePhase = 'washing' | 'drying' | 'cooling';

export type MachineView = {
  uuid: string;
  type: MachineType;
  location: MachineLocation;
  gender: string;
  id: number;
  state: MachineState;
  phase: MachinePhase;
  /** 남은 시간 ÷ 전체 시간(0–1). 남은 시간을 모르면 0 */
  level: number;
  remainingMinutes?: number;
  elapsedMinutes?: number;
  /** 끝나는 예상 시각(ms) */
  endsAt?: number;
  mine: boolean;
};

const toPhase = (type: MachineType, thinqState: unknown): MachinePhase => {
  if (type === 'washer') return 'washing';
  return thinqState === 'COOLING' ? 'cooling' : 'drying';
};

/**
 * ThinQ 남은 시간은 `thinqUpdatedAt` 시점의 값이라, 지금까지 흐른 시간을 빼야 종료 시각이 매번 같은 값으로 나온다.
 * 조회 시각을 모르면 받은 값을 그대로 쓴다.
 */
function resolveLiveRemaining(machine: MachineListItem, now: number) {
  const remaining = resolveRemainingMinutes(machine);
  if (remaining === null) return undefined;
  const updatedAt = machine.thinqUpdatedAt ? Date.parse(machine.thinqUpdatedAt) : Number.NaN;
  if (!Number.isFinite(updatedAt)) return { minutes: remaining, endsAt: now + remaining * 60_000 };
  const endsAt = updatedAt + remaining * 60_000;
  return { minutes: Math.max(0, Math.ceil((endsAt - now) / 60_000)), endsAt };
}

/**
 * 세탁기는 ThinQ가 없어, 사용자가 직접 입력한 `estimatedEndsAt`으로 남은 시간을 만든다.
 * 입력이 없거나 이미 지났으면(사이클이 더 걸리는 중) 없는 것으로 보고 경과 시간을 보여준다.
 */
function resolveEnteredRemaining(machine: MachineListItem, now: number) {
  const iso = machine.currentUsage?.estimatedEndsAt;
  const endsAt = iso ? Date.parse(iso) : Number.NaN;
  if (!Number.isFinite(endsAt) || endsAt <= now) return undefined;
  return { minutes: Math.ceil((endsAt - now) / 60_000), endsAt };
}

export function toMachineIdentity(
  machine: Pick<MachineListItem, 'uuid' | 'type' | 'location' | 'gender' | 'index'>,
) {
  return {
    uuid: machine.uuid,
    type: (machine.type === 'DRYER' ? 'dryer' : 'washer') as MachineType,
    location: (machine.location === 'B' ? 'b' : 'a') as MachineLocation,
    gender: machine.gender.toLowerCase(),
    id: machine.index,
  } satisfies Partial<MachineView>;
}

export function toMachineView(
  machine: MachineListItem,
  now: number,
  myMachineUuids: ReadonlySet<string>,
): MachineView {
  const identity = toMachineIdentity(machine);
  const base = {
    ...identity,
    phase: toPhase(identity.type, machine.thinqCurrentState),
    mine: myMachineUuids.has(machine.uuid),
    level: 0,
  };

  if (!machine.isAvailable) return { ...base, state: 'off' };
  if (machine.status === 'IDLE') return { ...base, state: 'idle' };

  const elapsedMinutes = getMachineElapsedMinutes(machine.currentUsage?.startedAt, now);
  if (identity.type === 'washer') {
    const entered = resolveEnteredRemaining(machine, now);
    if (!entered) return { ...base, state: 'elapsed', elapsedMinutes };

    const total = (elapsedMinutes ?? 0) + entered.minutes;
    return {
      ...base,
      state: 'running',
      level: total > 0 ? entered.minutes / total : 1,
      remainingMinutes: entered.minutes,
      elapsedMinutes,
      endsAt: entered.endsAt,
    };
  }

  if (isThinqRemainingDetecting(machine)) return { ...base, state: 'detecting', elapsedMinutes };

  // ThinQ에 연결되지 않은 기기는 남은 시간이 와도 믿을 수 없어, 지난 시간만 보여 준다.
  const isThinq = typeof machine.thinqDeviceId === 'string' && machine.thinqDeviceId !== '';
  const remaining = isThinq ? resolveLiveRemaining(machine, now) : undefined;
  if (!remaining) return { ...base, state: 'elapsed', elapsedMinutes };

  // 전체 시간은 서버가 주지 않아 지난 시간과 남은 시간을 더해 어림한다.
  const total = (elapsedMinutes ?? 0) + remaining.minutes;
  return {
    ...base,
    state: (machine.thinqCurrentState as unknown) === 'PAUSE' ? 'paused' : 'running',
    level: total > 0 ? remaining.minutes / total : 1,
    remainingMinutes: remaining.minutes,
    elapsedMinutes,
    endsAt: remaining.endsAt,
  };
}
