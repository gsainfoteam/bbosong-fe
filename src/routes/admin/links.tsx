import { createFileRoute } from '@tanstack/react-router';

import { AdminLinksScreen } from '@/features/admin';

export const Route = createFileRoute('/admin/links')({ component: AdminLinksScreen });
