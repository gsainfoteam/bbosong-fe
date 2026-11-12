import { describe, expect, it } from 'vitest';

import { rewriteIndexHtmlPrecacheToRoot } from './pwa-precache-manifest';

describe('rewriteIndexHtmlPrecacheToRoot', () => {
  it('rewrites index.html precache entries to the Cloudflare-canonical /', () => {
    const result = rewriteIndexHtmlPrecacheToRoot([
      { url: 'assets/main.js', revision: null, size: 10 },
      { url: 'index.html', revision: 'abc', size: 20 },
      { url: '/index.html', revision: 'def', size: 30 },
      { url: 'manifest.json', revision: 'ghi', size: 40 },
    ]);

    expect(result).toEqual([
      { url: 'assets/main.js', revision: null, size: 10 },
      { url: '/', revision: 'abc', size: 20 },
      { url: '/', revision: 'def', size: 30 },
      { url: 'manifest.json', revision: 'ghi', size: 40 },
    ]);
  });

  it('leaves manifests without index.html unchanged', () => {
    const entries = [
      { url: 'assets/main.js', revision: null, size: 10 },
      { url: 'manifest.json', revision: 'ghi', size: 40 },
    ];

    expect(rewriteIndexHtmlPrecacheToRoot(entries)).toEqual(entries);
  });
});
