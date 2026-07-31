import { StrictMode } from 'react';

import ReactDOM from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';

import { i18n } from '@/common/lib/i18n';

import { App } from './app';

import './styles.css';
import '@/common/lib/dayjs';

ReactDOM.createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </StrictMode>,
);
