export type DailySessionStatsRange = 7 | 14 | 30 | 90;

const KST_DATE = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Format an instant as a KST calendar `YYYY-MM-DD` (en-CA → ISO date). */
export function formatKstDate(instant: Date): string {
  return KST_DATE.format(instant);
}

/**
 * Inclusive KST `[from, to]` ending today for the given preset length.
 * `to` is today's KST date; `from` is `days - 1` calendar days earlier.
 */
export function getDailySessionStatsQueryRange(
  days: DailySessionStatsRange,
  now: Date = new Date(),
): { from: string; to: string } {
  const to = formatKstDate(now);
  const toNoonKst = new Date(`${to}T12:00:00+09:00`);
  const fromInstant = new Date(toNoonKst.getTime() - (days - 1) * 86_400_000);
  return { from: formatKstDate(fromInstant), to };
}
