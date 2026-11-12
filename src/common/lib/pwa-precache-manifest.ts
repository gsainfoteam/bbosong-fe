/**
 * Cloudflare Pages는 /index.html 요청을 / 로 308 한다.
 * Workbox가 index.html 을 precache/navigateFallback 하면 redirected 응답이
 * navigation(redirect mode: manual)에 쓰이며 브라우저가 거부한다.
 * 최종 URL(/)로 바꿔 리다이렉트를 피한다.
 */
export type PrecacheManifestEntry = {
  url: string;
  revision: string | null;
  size?: number;
};

export function rewriteIndexHtmlPrecacheToRoot<T extends { url: string }>(
  entries: readonly T[],
): T[] {
  return entries.map((entry) => {
    if (entry.url === 'index.html' || entry.url === '/index.html') {
      return { ...entry, url: '/' };
    }

    return entry;
  });
}
