import { createFileRoute } from '@tanstack/react-router';

import { UserLayoutFrame } from '@/common/frames/user-layout-frame.tsx';

export const Route = createFileRoute('/_auth-required/_user')({
  component: UserLayoutFrame,
});
