import { createFileRoute } from '@tanstack/react-router';

import { AdminPowerScreen } from '@/features/admin';

export const Route = createFileRoute('/admin/power')({ component: AdminPowerScreen });
