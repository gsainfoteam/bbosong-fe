import { useEffect, useState } from 'react';

import { type AdminMachine } from '../models';

export function useMachineTiming(enabled: boolean) {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (!enabled) return;
    const refresh = () => setNow(Date.now());
    // Refresh on activation without waiting for the first polling interval.
    const activation = window.setTimeout(refresh, 0);
    const interval = window.setInterval(refresh, 30_000);
    return () => {
      window.clearTimeout(activation);
      window.clearInterval(interval);
    };
  }, [enabled]);

  return now;
}

function toRelativeTime(seconds: number): [number, Intl.RelativeTimeFormatUnit] {
  if (seconds < 60) return [seconds, 'second'];
  if (seconds < 3600) return [Math.floor(seconds / 60), 'minute'];
  if (seconds < 86400) return [Math.floor(seconds / 3600), 'hour'];
  return [Math.floor(seconds / 86400), 'day'];
}

export function formatMachineLastSeen(
  value: string | null | undefined,
  now: number,
  locale: string,
) {
  const timestamp = value ? Date.parse(value) : Number.NaN;
  if (!Number.isFinite(timestamp)) return null;

  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
  const [amount, unit] = toRelativeTime(seconds);

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
  const timestamp = startedAt ? Date.parse(startedAt) : Number.NaN;
  if (machine.status === 'IDLE' || !Number.isFinite(timestamp)) return null;
  return Math.max(0, Math.floor((now - timestamp) / 60_000));
}
