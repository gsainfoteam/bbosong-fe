import { StrictMode } from 'react';

import ReactDOM from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';

import { i18n } from '@/common/lib/i18n';
import { installNativeStorage } from '@/common/lib/native-storage';
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

// 네이티브 앱: 저장소 미러링과 인앱 브라우저 인증 콜백 복원은 인증 공급자가 마운트되기 전에
// 끝나야 하므로(라이브러리는 마운트 시 저장소와 URL을 읽는다) 끝난 뒤 렌더한다.
void Promise.all([installNativeStorage(), initNativeAuthCallback()]).finally(renderApp);
