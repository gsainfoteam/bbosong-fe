import { useEffect, useState } from 'react';

import { resolveRemainingMinutes } from '@/common/utils';

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

export function getMachineDisplayRemainingMinutes(machine: {
  thinqDeviceId?: unknown;
  thinqRemainingMinutes?: unknown;
  currentUsage?: unknown;
}): number | undefined {
  const isThinqMapped = typeof machine.thinqDeviceId === 'string' && !!machine.thinqDeviceId;
  if (!isThinqMapped) return undefined;
  const remainingMinutes = resolveRemainingMinutes(machine);
  return remainingMinutes === null ? undefined : remainingMinutes;
}
