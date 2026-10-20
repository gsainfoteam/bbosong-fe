const DEFAULT_WINDOW_MS = 60 * 60 * 1000;

/** Moves the power-query start earlier. An empty start uses the API default of the last hour. */
export function shiftPowerQueryStart(
  startedAt: string | undefined,
  minutes: number,
  now = Date.now(),
) {
  const parsed = startedAt ? Date.parse(startedAt) : Number.NaN;
  const base = Number.isFinite(parsed) ? parsed : now - DEFAULT_WINDOW_MS;
  return new Date(base - minutes * 60 * 1000).toISOString();
}

/** Formats an ISO timestamp for a `datetime-local` input in the local timezone. */
export function toDatetimeLocalValue(iso: string) {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
