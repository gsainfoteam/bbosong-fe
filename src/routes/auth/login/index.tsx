import { createFileRoute } from '@tanstack/react-router';

import { IdpLoginFrame } from '@/features/auth';

export const Route = createFileRoute('/auth/login/')({
  component: IdpLoginFrame,
});
