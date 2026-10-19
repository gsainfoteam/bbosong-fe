import { createFileRoute } from '@tanstack/react-router';

import { AdminOverviewScreen } from '@/features/admin';

export const Route = createFileRoute('/admin/')({ component: AdminOverviewScreen });
