import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth-required/_user/')({
  beforeLoad: () => {
    throw redirect({
      to: '/status',
      replace: true,
    });
  },
});
