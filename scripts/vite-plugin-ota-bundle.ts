import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

import { zipSync } from 'fflate';
import { type Plugin } from 'vite';

export type OtaManifest = {
  /** 번들 식별자. 앱에 내장된 `__BUILD_VERSION__`과 같은 값이다 */
  version: string;
  /** 웹 호스트 기준 번들 zip 경로 */
  url: string;
  /** zip의 sha256(hex) */
  checksum: string;
  /** 이 번들을 적용할 수 있는 최소 네이티브 앱 버전 */
  minNativeVersion: string;
};

export type OtaBundleOptions = {
  version: string;
  minNativeVersion: string;
};

const MANIFEST_FILE = 'latest.json';

function collectFiles(root: string, directory = root): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    return entry.isDirectory() ? collectFiles(root, path) : [path];
  });
}

/**
 * 빌드 결과(dist)를 Capacitor OTA 번들(zip)로 묶고 `latest.json`을 만든다.
 *
 * 웹 배포에 그대로 실려 정적 파일로 서빙되며, 네이티브 앱이 `latest.json`을 조회해 새 번들을 내려받는다.
 */
export function otaBundle({ version, minNativeVersion }: OtaBundleOptions): Plugin {
  let outDir = 'dist';

  return {
    name: 'ota-bundle',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle: {
      // PWA 플러그인 등이 dist에 쓰는 파일까지 포함하도록 마지막에 실행한다
      order: 'post',
      handler() {
        const bundleName = `bundle-${version}.zip`;
        const files: Record<string, Uint8Array> = {};

        for (const path of collectFiles(outDir)) {
          const name = relative(outDir, path).split(sep).join('/');
          // 이전 빌드 산출물과 매니페스트는 번들에 넣지 않는다
          if (name === MANIFEST_FILE || /^bundle-.*\.zip$/.test(name)) continue;
          files[name] = readFileSync(path);
        }

        const zip = zipSync(files, { level: 6 });
        const manifest: OtaManifest = {
          version,
          url: `/${bundleName}`,
          checksum: createHash('sha256').update(zip).digest('hex'),
          minNativeVersion,
        };

        writeFileSync(join(outDir, bundleName), zip);
        writeFileSync(join(outDir, MANIFEST_FILE), `${JSON.stringify(manifest, null, 2)}\n`);
      },
    },
  };
}
