import { createFileRoute } from '@tanstack/react-router';

import { MapFrame } from '@/features/user';

export const Route = createFileRoute('/_auth-required/_user/map')({
  component: MapFrame,
});
