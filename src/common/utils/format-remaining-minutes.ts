/** ThinQ 남은 분 수를 표시용 시·분으로 나눈다. 예: 90 → { hours: 1, minutes: 30 } */
export function formatRemainingMinutes(totalMinutes: number): {
  hours: number;
  minutes: number;
} {
  const value = Math.max(0, Math.floor(totalMinutes));
  return {
    hours: Math.floor(value / 60),
    minutes: value % 60,
  };
}

/** `thinqRemainingMinutes` 또는 `currentUsage.remainingMinutes`에서 남은 분을 고른다. */
export function resolveRemainingMinutes(machine: {
  thinqRemainingMinutes?: unknown;
  currentUsage?: unknown;
}): number | null {
  if (typeof machine.thinqRemainingMinutes === 'number') return machine.thinqRemainingMinutes;
  const usage = machine.currentUsage;
  if (usage && typeof usage === 'object' && 'remainingMinutes' in usage) {
    const remaining = (usage as { remainingMinutes?: unknown }).remainingMinutes;
    if (typeof remaining === 'number') return remaining;
  }
  return null;
}
