import { createFileRoute } from '@tanstack/react-router';

import { GenderSelectFrame } from '@/features/auth';

export const Route = createFileRoute('/auth/login/gender')({
  component: GenderSelectFrame,
});
