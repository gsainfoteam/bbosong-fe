import { QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';

import { SplashScreen } from '@/common/components';
import type { ConsentFormData } from '@/features/auth';

import { routeTree } from './routeTree.gen';

export const queryClient = new QueryClient();

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  // 라우트 로딩 중 빈 화면이 끼면 스플래시 로고가 사라졌다 나타나 깜빡인다. 바로 스플래시로 이어 붙인다
  defaultPendingComponent: SplashScreen,
  defaultPendingMs: 0,
  defaultPendingMinMs: 0,
  context: {
    queryClient,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
  interface HistoryState {
    consentFormData?: ConsentFormData;
  }
}
