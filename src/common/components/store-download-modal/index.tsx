import { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { isNativeApp } from '@/common/lib/platform';
import {
  dismissStorePrompt,
  getMobileStore,
  type MobileStore,
  shouldShowStorePrompt,
  STORE_URLS,
} from '@/common/lib/store-redirect';

import { Modal } from '../modal';

/**
 * 모바일 브라우저에서 접속하면 앱 스토어 설치를 안내한다.
 * 네이티브 앱 안에서는 보여주지 않으며, 닫으면 다시 보지 않는다.
 */
export function StoreDownloadModal() {
  const { t } = useTranslation('common');
  // 마운트 시 한 번만 판별한다. 네이티브 앱이거나 이미 닫았으면 null이라 렌더하지 않는다.
  const [store, setStore] = useState<MobileStore | null>(() => {
    if (isNativeApp() || !shouldShowStorePrompt()) return null;

    return getMobileStore(navigator.userAgent, navigator.maxTouchPoints);
  });

  if (!store) return null;

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
