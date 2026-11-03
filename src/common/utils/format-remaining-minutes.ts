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
  currentUsage?: { remainingMinutes?: unknown } | null;
}): number | null {
  if (typeof machine.thinqRemainingMinutes === 'number') return machine.thinqRemainingMinutes;
  if (typeof machine.currentUsage?.remainingMinutes === 'number') {
    return machine.currentUsage.remainingMinutes;
  }
  return null;
}
