import { useEffect, useState } from 'react';

import { getNativeAppVersion } from '@/common/lib';

export type AppVersions = {
  /** 설치된 네이티브 앱(스토어 바이너리) 버전. 웹에서는 undefined */
  app?: string;
  /** 현재 실행 중인 웹 번들 버전. 네이티브 앱에서는 OTA로 교체된 번들 */
  web: string;
};

/** 앱 버전과 웹 버전을 따로 제공한다. 앱 버전은 비동기로 조회되어 준비되기 전에는 비어 있다 */
export function useAppVersions(): AppVersions {
  const [app, setApp] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    void getNativeAppVersion().then((version) => {
      if (!cancelled && version) setApp(version);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { app, web: __BUILD_VERSION__ };
}
