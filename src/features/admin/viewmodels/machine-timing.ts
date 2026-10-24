import { useEffect, useState } from 'react';

import { type AdminMachine } from '../models';

export function useMachineTiming(enabled: boolean) {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (!enabled) return;
    const interval = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(interval);
  }, [enabled]);

  return now;
}

export function formatMachineLastSeen(
  value: string | null | undefined,
  now: number,
  locale: string,
) {
  const timestamp = value ? Date.parse(value) : NaN;
  if (!Number.isFinite(timestamp)) return null;

  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
  const [amount, unit] =
    seconds < 60
      ? [seconds, 'second' as const]
      : seconds < 3600
        ? [Math.floor(seconds / 60), 'minute' as const]
        : seconds < 86400
          ? [Math.floor(seconds / 3600), 'hour' as const]
          : [Math.floor(seconds / 86400), 'day' as const];

  return {
    relative: new Intl.RelativeTimeFormat(locale, { numeric: 'always' }).format(-amount, unit),
    absolute: `${new Date(timestamp).toLocaleString(locale, {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })} KST`,
    dateTime: new Date(timestamp).toISOString(),
  };
}

export function getMachineOperatingMinutes(machine: AdminMachine, now: number) {
  const startedAt = machine.currentUsage?.startedAt;
  const timestamp = startedAt ? Date.parse(startedAt) : NaN;
  if (machine.status === 'IDLE' || !Number.isFinite(timestamp)) return null;
  return Math.max(0, Math.floor((now - timestamp) / 60_000));
}
