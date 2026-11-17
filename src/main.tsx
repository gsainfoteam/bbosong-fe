import { StrictMode } from 'react';

import ReactDOM from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';

import { i18n } from '@/common/lib/i18n';
import { initNativeAuthCallback } from '@/common/lib/platform';
import { initInstallPromptCapture, registerServiceWorker } from '@/common/lib/service-worker';

import { App } from './app';

import './styles.css';
import '@/common/lib/amplitude';
import '@/common/lib/dayjs';

// SW 등록은 렌더링을 막을 이유가 없으므로 await하지 않는다
void registerServiceWorker();

// beforeinstallprompt는 로드 직후 한 번만 발화하므로 React 마운트 전에 가로채 둔다
initInstallPromptCapture();

function renderApp() {
  ReactDOM.createRoot(document.getElementById('app')!).render(
    <StrictMode>
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </StrictMode>,
  );
}

// 네이티브 앱: 인앱 브라우저 인증 후 커스텀 스킴 복귀를 받아 OIDC 콜백을 이어서 처리한다.
// 콜드 스타트 콜백(getLaunchUrl)을 인증 공급자가 마운트되기 전에 복원해야 하므로 끝난 뒤 렌더한다.
void initNativeAuthCallback().finally(renderApp);
