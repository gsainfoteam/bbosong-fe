/** QR 스캔 문자열을 `new URL`로 파싱 가능하게 정규화한다. 스킴이 없으면 `https://`를 붙인다. */
export function normalizeQrScanUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/')) return `https://qr.local${trimmed}`;
  return `https://${trimmed}`;
}

/** QR 스캔 값에서 기계 shortCode(경로 마지막 세그먼트 또는 bare ID)를 추출한다. */
export function extractMachineShortCodeFromQr(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const shortCode =
      new URL(normalizeQrScanUrl(trimmed)).pathname.split('/').findLast(Boolean) ?? null;
    if (shortCode) return shortCode;
  } catch {
    // fall through to bare-id handling
  }

  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed);
  if (!hasScheme && !trimmed.includes('/')) return trimmed;
  return null;
}
