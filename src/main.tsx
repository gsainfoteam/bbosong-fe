import { StrictMode } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import ReactDOM from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';

import './styles.css';
import '@/common/lib/dayjs';

import { i18n } from '@/common/lib/i18n';

import { queryClient, router } from './router';

ReactDOM.createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        {import.meta.env.DEV && <TanStackRouterDevtools router={router} position="bottom-left" />}
      </QueryClientProvider>
    </I18nextProvider>
  </StrictMode>,
);
