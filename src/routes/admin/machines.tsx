import { createFileRoute } from '@tanstack/react-router';

import { AdminMachinesScreen } from '@/features/admin';

export const Route = createFileRoute('/admin/machines')({ component: AdminMachinesScreen });
