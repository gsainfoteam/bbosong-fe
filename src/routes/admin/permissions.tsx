import { createFileRoute } from '@tanstack/react-router';

import { AdminPermissionsScreen } from '@/features/admin';

export const Route = createFileRoute('/admin/permissions')({ component: AdminPermissionsScreen });
