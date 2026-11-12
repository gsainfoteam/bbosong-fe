import { useEffect, useState } from 'react';

import { isThinqRemainingDetecting, resolveRemainingMinutes } from '@/common/utils';

export function useNowTick(enabled: boolean, intervalMs = 1000) {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (!enabled) return;
    const interval = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(interval);
  }, [enabled, intervalMs]);

  return now;
}

export function getMachineElapsedMinutes(
  startedAt: string | null | undefined,
  now: number,
): number | undefined {
  const startedAtMs = startedAt ? Date.parse(startedAt) : Number.NaN;
  if (!Number.isFinite(startedAtMs)) return undefined;
  return Math.max(0, Math.floor((now - startedAtMs) / 60_000));
}

export type MachineRemainingDisplay = { kind: 'minutes'; minutes: number } | { kind: 'detecting' };

/** ThinQ 매핑 기기의 남은 시간 표시. 미매핑이면 undefined(경과 시간으로 폴백). */
export function getMachineRemainingDisplay(machine: {
  thinqDeviceId?: unknown;
  thinqCurrentState?: unknown;
  thinqRemainingMinutes?: unknown;
  currentUsage?: unknown;
  status?: string;
}): MachineRemainingDisplay | undefined {
  if (typeof machine.thinqDeviceId !== 'string' || !machine.thinqDeviceId) return undefined;
  if (isThinqRemainingDetecting(machine)) return { kind: 'detecting' };
  const remainingMinutes = resolveRemainingMinutes(machine);
  if (remainingMinutes === null) return undefined;
  return { kind: 'minutes', minutes: remainingMinutes };
}
