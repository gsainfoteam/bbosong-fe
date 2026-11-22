/** 물은 아무리 적어도 이 비율 아래로는 내려가지 않는다. 이 바닥에 닿은 때가 "거의 끝남"이다. */
export const MIN_LEVEL = 0.06;

/**
 * 찬 높이 = 남은 시간 ÷ 전체 시간.
 * API가 전체 시간을 주지 않으므로 지난 시간 + 남은 시간으로 추정하고,
 * 지난 시간을 모르면 가득 찬 것으로 본다.
 */
export function levelRatio(remainingMinutes: number, elapsedMinutes: number | undefined) {
  const total = remainingMinutes + (elapsedMinutes ?? 0);
  if (total <= 0) return MIN_LEVEL;

  return Math.min(1, Math.max(MIN_LEVEL, remainingMinutes / total));
}
