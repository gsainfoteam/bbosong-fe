import { QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';

import type { ConsentFormData } from '@/features/auth';

import { routeTree } from './routeTree.gen';

export const queryClient = new QueryClient();

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
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
