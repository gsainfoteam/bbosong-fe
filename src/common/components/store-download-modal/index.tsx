import { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { APP_LINK_HOST, isNativeApp } from '@/common/lib/platform';
import {
  buildAndroidIntentUrl,
  buildAppSchemeUrl,
  dismissStorePrompt,
  getMobileStore,
  isOpenInAppPath,
  type MobileStore,
  shouldShowStorePrompt,
  STORE_URLS,
} from '@/common/lib/store-redirect';

import { Modal } from '../modal';

/** 앱이 열리지 않아 페이지가 그대로 보이면 스토어로 보내기까지 기다리는 시간 */
const OPEN_APP_FALLBACK_MS = 1500;

type OpenInApp = { pathname: string; search: string };

/** iOS: 커스텀 스킴으로 앱을 연다. 앱이 없어 페이지가 그대로 보이면 App Store로 보낸다 */
function openIosApp({ pathname, search }: OpenInApp) {
  window.location.href = buildAppSchemeUrl(pathname, search);
  window.setTimeout(() => {
    if (document.visibilityState === 'visible') window.location.href = STORE_URLS.ios;
  }, OPEN_APP_FALLBACK_MS);
}

/**
 * 모바일 브라우저에서 접속하면 앱 스토어 설치를 안내한다.
 * QR 단축 링크(기기 등록 화면)로 들어온 경우에는 앱 열기를 안내한다.
 * 네이티브 앱 안에서는 보여주지 않으며, 설치 안내는 닫으면 다시 보지 않는다.
 */
export function StoreDownloadModal() {
  const { t } = useTranslation('common');
  // 마운트 시 한 번만 판별한다. 로그인 리다이렉트로 URL이 바뀌어도 처음 들어온 경로로 연다.
  const [state] = useState(() => {
    if (isNativeApp()) return { store: null, openInApp: null };

    const mobileStore = getMobileStore(navigator.userAgent, navigator.maxTouchPoints);
    const { pathname, search } = window.location;
    // 열기 안내는 이전에 설치 안내를 닫았더라도 보여준다
    if (mobileStore && isOpenInAppPath(pathname)) {
      return { store: mobileStore, openInApp: { pathname, search } };
    }

    return { store: shouldShowStorePrompt() ? mobileStore : null, openInApp: null };
  });
  const [store, setStore] = useState<MobileStore | null>(state.store);
  const { openInApp } = state;

  if (!store) return null;

  if (openInApp) {
    const open = () => {
      if (store === 'ios') {
        openIosApp(openInApp);
      } else {
        window.location.href = buildAndroidIntentUrl(
          APP_LINK_HOST,
          openInApp.pathname,
          openInApp.search,
        );
      }
    };

    return (
      <Modal
        title={t('storeDownload.openTitle')}
        description={t('storeDownload.openDescription')}
        confirmText={t('storeDownload.open')}
        cancelText={t('storeDownload.later')}
        onConfirm={open}
        onClose={() => setStore(null)}
      />
    );
  }
  const close = () => {
    dismissStorePrompt();
    setStore(null);
  };

  const install = () => {
    window.open(STORE_URLS[store], '_blank', 'noopener');
    close();
  };

  return (
    <Modal
      title={t('storeDownload.title')}
      description={t('storeDownload.description')}
      confirmText={t('storeDownload.install')}
      cancelText={t('storeDownload.later')}
      onConfirm={install}
      onClose={close}
    />
  );
}
