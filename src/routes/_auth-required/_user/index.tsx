import { createFileRoute } from '@tanstack/react-router';

import { MainFrame } from '@/features/user';

export const Route = createFileRoute('/_auth-required/_user/')({
  // beforeLoad: () => {
  //   throw redirect({
  //     to: '/status',
  //     replace: true,
  //   });
  // },
  component: MainFrame,
});
